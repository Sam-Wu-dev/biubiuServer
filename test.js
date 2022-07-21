// import * as cp from 'child_process';
// cp.exec('python 01_body_from_image.py',{cwd:'../../openpose/examples/tutorial_api_python'}, (error, stdout, stderr) => {
//   if (error) {
//     console.error(`exec error: ${error}`);
//     return;
//   }
//   console.log(`stdout: ${stdout}`);
//   console.log(`stderr: ${stderr}`);
// });
// let process = spawn('python', [
//     "./process.py",
//     req.query.name,
//     req.query.from
//   ])

//   process.stdout.on('data', (data) => {
//     const parsedString = JSON.parse(data)
//     res.json(parsedString)
//   })