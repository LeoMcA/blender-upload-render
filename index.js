const express = require("express");
const socketio = require("socket.io");
const file_upload = require("socketio-file-upload");
const child_process = require("child_process");

const app = express();
const port = 3000;

app.use(
  express.static("static"),
  express.static("node_modules/bootstrap/dist"),
  express.static("download"),
  file_upload.router
);

const server = app.listen(port, () => {
  console.log(`blender-upload-render listening at http://localhost:${port}`);
});

const io = socketio.listen(server);
io.sockets.on("connection", (socket) => {
  const uploader = new file_upload();
  uploader.dir = "upload";
  uploader.listen(socket);

  uploader.on("saved", (e) => {
    socket.on("launch", () => {
      const blender = child_process.spawn("blender", [
        "-b",
        e.file.pathName,
        "-o",
        `blender_out/${socket.id}/`,
        "-f",
        "0",
      ]);

      blender.stdout.on("data", (d) => {
        console.log(String(d));
        socket.emit("stdout", String(d));
      });

      blender.stderr.on("data", (d) => {
        console.log(`stderr: ${d}`);
      });

      blender.on("close", (code) => {
        console.log("finished");
        const zip = child_process.spawn(
          "zip",
          ["-1", "-r", `../../download/${socket.id}.zip`, "."],
          {
            cwd: `blender_out/${socket.id}`,
          }
        );

        zip.stdout.on("data", (d) => {
          console.log(String(d));
          socket.emit("stdout", String(d));
        });

        zip.on("close", (code) => {
          socket.emit("download");
        });
      });
    });
  });
});
