const pdfTool=new URLSearchParams(location.search).get("tool");
const panelMap={merge:"mergePanel",split:"splitPanel",rotate:"rotatePanel",render:"pdfImagePanel",images:"imagePdfPanel"};
if(pdfTool&&panelMap[pdfTool]){
  document.querySelectorAll(".pdf-tabs button").forEach(button=>button.classList.toggle("active",button.dataset.panel===panelMap[pdfTool]));
  document.querySelectorAll(".pdf-panel").forEach(panel=>panel.classList.toggle("active",panel.id===panelMap[pdfTool]));
}
