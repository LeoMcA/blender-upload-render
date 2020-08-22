var socket = io.connect();
var file_upload = new SocketIOFileUpload(socket);

file_upload.listenOnInput(document.querySelector("#upload_input"));

file_upload.addEventListener("progress", (e) => {
  const percent = (e.bytesLoaded / e.file.size) * 100;
  const progress_bar = document.querySelector(".progress-bar");
  progress_bar.style.width = percent + "%";
  progress_bar.setAttribute("aria-valuenow", percent);
});

file_upload.addEventListener("complete", (e) => {
  const progress_bar = document.querySelector(".progress-bar");
  progress_bar.style.width = "100%";
  progress_bar.setAttribute("aria-valuenow", 100);
  document.querySelector("#launch").removeAttribute("disabled");
});

document.querySelector("#launch").addEventListener("click", (e) => {
  socket.emit("launch");
});

socket.on("stdout", (line) => {
  const text = document.createTextNode(line);
  const terminal = document.querySelector("#terminal");
  terminal.appendChild(text);
  terminal.scrollTo(0, terminal.scrollHeight);
});

socket.on("download", () => {
  const download = document.querySelector("#download");
  download.setAttribute("href", socket.id + ".zip");
  download.removeAttribute("aria-disabled");
  download.classList.remove("disabled");
});
