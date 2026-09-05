const pageParams = new URLSearchParams(window.location.search);
const requestedFormat = pageParams.get("format");
const requestedTool = pageParams.get("tool");
const requestedInput = pageParams.get("input");
const requestedMimeTypes = {jpg:"image/jpeg",png:"image/png",webp:"image/webp"};

if(requestedFormat && requestedMimeTypes[requestedFormat]){
  format = requestedMimeTypes[requestedFormat];
  document.querySelectorAll(".formats button").forEach(button=>{
    button.classList.toggle("active",button.dataset.format===format);
  });
  document.querySelector("#convert").textContent=`Convert to ${labels[format]}`;
  document.querySelector("#qualityBox").classList.toggle("hidden",format==="image/png");
}

if(requestedTool==="compress"){
  quality.value="70";
  document.querySelector("#qualityValue").textContent="70%";
}
if(requestedTool==="resize"){
  document.querySelector(".settings h2").textContent="Resize settings";
  document.querySelector("#convert").textContent=`Resize and convert to ${labels[format]}`;
}
if(requestedInput){
  const acceptMap={jpg:"image/jpeg,.jpg,.jpeg",png:"image/png,.png",webp:"image/webp,.webp",heic:"image/heic,image/heif,.heic,.heif"};
  if(acceptMap[requestedInput])document.querySelector("#fileInput").accept=acceptMap[requestedInput];
}
