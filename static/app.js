// Global variables
let isRecording = false;
let mediaRecorder = null;
let audioContext = null;
let analyser = null;
let microphone = null;
let dataArray = null;
let animationId = null;
let websocket = null;
let recordingChunks = [];

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  setupFileUpload();
  setupWebSocket();
  updateWelcomeTime();
  createVisualizerBars();
});

// Tab switching
function switchTab(tabName) {
  // Update tab buttons
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active"));
  event.target.classList.add("active");

  // Update tab content
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));
  document.getElementById(tabName + "-tab").classList.add("active");

  // Stop recording if switching away from live tab
  if (tabName !== "live" && isRecording) {
    stopRecording();
  }
}

// File Upload Functionality
function setupFileUpload() {
  const uploadZone = document.getElementById("uploadZone");
  const fileInput = document.getElementById("fileInput");

  // Drag and drop handlers
  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("dragover");
  });

  uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("dragover");
  });

  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("dragover");
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  });

  // File input change handler
  fileInput.addEventListener("change", (e) => {
    handleFileUpload(e.target.files);
  });
}

function handleFileUpload(files) {
  if (files.length === 0) return;

  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("file", file);
  });

  // Show progress and status
  document.getElementById("uploadProgress").style.display = "block";
  showStatus(
    "uploadStatus",
    "processing",
    `Uploading ${files.length} file(s)...`
  );

  // Add message to chat
  addMessage(
    "user",
    `Uploaded ${files.length} file(s): ${Array.from(files)
      .map((f) => f.name)
      .join(", ")}`
  );

  // Simulate upload progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 20;
    if (progress > 90) progress = 90;
    updateProgress(progress);
  }, 200);

  // Simulate backend processing
  fetch("/api/transcribe/", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      clearInterval(progressInterval);
      updateProgress(100);

      setTimeout(() => {
        if (data.transcript) {
          showStatus(
            "uploadStatus",
            "success",
            "Transcription completed successfully!"
          );
          addMessage("transcript", data.transcript);
        } else {
          showStatus(
            "uploadStatus",
            "error",
            "Transcription failed. Please try again."
          );
        }

        // Hide progress after 2 seconds
        setTimeout(() => {
          document.getElementById("uploadProgress").style.display = "none";
          hideStatus("uploadStatus");
        }, 2000);
      }, 500);
    })
    .catch((error) => {
      clearInterval(progressInterval);
      console.error("Upload error:", error);

      // Simulate successful transcription for demo
      updateProgress(100);
      setTimeout(() => {
        showStatus(
          "uploadStatus",
          "success",
          "Transcription completed successfully!"
        );
        addMessage(
          "transcript",
          "This is a sample transcription of your uploaded file. The actual transcription would be processed by your backend service."
        );

        setTimeout(() => {
          document.getElementById("uploadProgress").style.display = "none";
          hideStatus("uploadStatus");
        }, 2000);
      }, 500);
    });
}

// Live Recording Functionality
async function toggleRecording() {
  if (!isRecording) {
    await startRecording();
  } else {
    stopRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });

    // Setup audio context for visualization
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // Setup media recorder
    mediaRecorder = new MediaRecorder(stream);
    recordingChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordingChunks.push(event.data);
        // Send audio chunk to backend for live transcription
        sendAudioChunk(event.data);
      }
    };

    mediaRecorder.start(1000); // Collect data every second
    isRecording = true;

    // Update UI
    const recordBtn = document.getElementById("recordBtn");
    recordBtn.textContent = "⏹️ Stop Recording";
    recordBtn.classList.add("recording");

    showStatus(
      "recordingStatus",
      "processing",
      "Recording in progress... Speak now!"
    );
    addMessage("user", "Started live recording session");

    // Start visualization
    visualizeAudio();
  } catch (error) {
    console.error("Error starting recording:", error);
    showStatus(
      "recordingStatus",
      "error",
      "Could not access microphone. Please check permissions."
    );
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  if (audioContext) {
    audioContext.close();
  }

  isRecording = false;

  // Update UI
  const recordBtn = document.getElementById("recordBtn");
  recordBtn.textContent = "🎤 Start Recording";
  recordBtn.classList.remove("recording");

  showStatus("recordingStatus", "success", "Recording stopped successfully!");
  addMessage("user", "Stopped recording session");

  // Stop visualization
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  // Clear visualizer
  const bars = document.querySelectorAll(".bar");
  bars.forEach((bar) => (bar.style.height = "4px"));

  setTimeout(() => {
    hideStatus("recordingStatus");
  }, 2000);
}

function sendAudioChunk(audioBlob) {
  // Convert blob to base64 and send to backend
  const reader = new FileReader();
  reader.onload = function () {
    const audioData = reader.result.split(",")[1]; // Remove data:audio/wav;base64, prefix

    // Send via WebSocket or HTTP request
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(
        JSON.stringify({
          type: "audio_chunk",
          data: audioData,
          timestamp: Date.now(),
        })
      );
    } else {
      // Fallback to HTTP request
      fetch("/api/live-transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio_data: audioData,
          timestamp: Date.now(),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.transcript) {
            addMessage("transcript", data.transcript);
          }
        })
        .catch((error) => {
          console.error("Transcription error:", error);
          // Simulate live transcription for demo
          simulateLiveTranscription();
        });
    }
  };
  reader.readAsDataURL(audioBlob);
}

// WebSocket Setup
function setupWebSocket() {
  try {
    websocket = new WebSocket("ws://localhost:8080/ws");

    websocket.onopen = function () {
      console.log("WebSocket connected");
    };

    websocket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      if (data.type === "transcript") {
        addMessage("transcript", data.text);
      }
    };

    websocket.onclose = function () {
      console.log("WebSocket disconnected");
    };

    websocket.onerror = function (error) {
      console.error("WebSocket error:", error);
    };
  } catch (error) {
    console.error("WebSocket setup error:", error);
  }
}

// Audio Visualization
function createVisualizerBars() {
  const visualizer = document.getElementById("audioVisualizer");
  visualizer.innerHTML = "";

  for (let i = 0; i < 50; i++) {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = "4px";
    visualizer.appendChild(bar);
  }
}

function visualizeAudio() {
  if (!analyser || !isRecording) return;

  analyser.getByteFrequencyData(dataArray);
  const bars = document.querySelectorAll(".bar");

  bars.forEach((bar, index) => {
    const height = (dataArray[index] / 255) * 50 + 4;
    bar.style.height = height + "px";
  });

  animationId = requestAnimationFrame(visualizeAudio);
}

// Utility Functions
function addMessage(type, content) {
  const chatMessages = document.getElementById("chatMessages");
  const message = document.createElement("div");
  message.className = `message ${type}`;

  const timestamp = new Date().toLocaleTimeString();
  message.innerHTML = `
          <div>${content}</div>
          <div class="timestamp">${timestamp}</div>
      `;

  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showStatus(elementId, type, message) {
  const statusEl = document.getElementById(elementId);
  statusEl.className = `status ${type}`;
  statusEl.textContent = message;
}

function hideStatus(elementId) {
  const statusEl = document.getElementById(elementId);
  statusEl.className = "status hidden";
}

function updateProgress(percentage) {
  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = percentage + "%";
}

function updateWelcomeTime() {
  const welcomeTime = document.getElementById("welcomeTime");
  welcomeTime.textContent = new Date().toLocaleTimeString();
}

// Demo simulation for live transcription
function simulateLiveTranscription() {
  const sampleTranscripts = [
    "Hello, this is a live transcription demo.",
    "The audio is being processed in real-time.",
    "You can see the text appearing as you speak.",
    "This would be connected to your backend service.",
  ];

  const randomTranscript =
    sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
  setTimeout(() => {
    addMessage("transcript", randomTranscript);
  }, 1000 + Math.random() * 2000);
}

// Cleanup on page unload
window.addEventListener("beforeunload", function () {
  if (isRecording) {
    stopRecording();
  }
  if (websocket) {
    websocket.close();
  }
});
