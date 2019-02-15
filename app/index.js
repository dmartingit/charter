const electron = require('electron')
const { clipboard } = require('electron')
const { dialog } = require('electron').remote
const win = electron.remote.getCurrentWindow();
const axios = require('axios');
const fs = require('fs');
const minimizeBtn = document.getElementById('minimizeBtn');
const maximizeBtn = document.getElementById('maximizeBtn');
const closeBtn = document.getElementById('closeBtn');
const chartSelector = document.getElementById('chartSelector');
const loadBtn = document.getElementById('loadBtn');
const saveBtn = document.getElementById('saveBtn');
const tracksTable = document.getElementById('tracksTable').getElementsByTagName('tbody')[0];
const preloader = document.getElementById('preloader');

const chartUrls = ['http://deutsche-dj-playlist.de/DDP-Charts-Top100', 'http://deutsche-dj-playlist.de/DDP-Charts-Neueinsteiger', 'http://deutsche-dj-playlist.de/DDP-Charts-Top100']
let tracks = new Array();

minimizeBtn.addEventListener('click', () => { win.minimize(); });
maximizeBtn.addEventListener('click', () => { win.isMaximized() ? win.unmaximize() : win.maximize(); });
closeBtn.addEventListener('click', () => { win.close(); });
M.FormSelect.init(chartSelector);

loadBtn.addEventListener('click', load);
saveBtn.addEventListener('click', save);

function load() {
  const selectedIndex = chartSelector.selectedIndex - 1;
  if (selectedIndex < 0 || selectedIndex > chartUrls.length) {
    M.toast({html: 'Please select a chartlist first.', classes: 'rounded'});
    return;
  }
  setLoading(true);
  axios.get(chartUrls[selectedIndex])
    .then(res => {
      setLoading(false);
      setTracks(parseTracks(res.data, selectedIndex === 2));
    })
}

function save() {
  if (tracks.length <= 0) return;
  let path = dialog.showSaveDialog();
  if (!path) return;
  const content = tracksToString();
  try {
    fs.writeFileSync(path, content, 'utf-8');
  } catch(e) {
    M.toast({html: 'Failed to save the file!', classes: 'rounded'});
  }
}

function copy() {
  const track = tracks[this.rowIndex - 1];
  clipboard.writeText(raw(track.interpret) + ' ' + raw(track.title));
  M.toast({html: 'Copied!', classes: 'rounded', displayLength: 1000})
}

function setLoading(b) {
  if (b) {
    tracksTable.innerHTML = '';
    loadBtn.classList.add('disabled');
    preloader.classList.remove('hide');

  } else {
    loadBtn.classList.remove('disabled');
    preloader.classList.add('hide');
  }
}

function parseTracks(data, onlyReentries = false) {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(data, 'text/html');
  const elements = Array.from(htmlDoc.getElementsByClassName('eintrag')).slice(1);
  tracks = new Array();
  for(const e of elements) {
    if (onlyReentries && e.querySelectorAll('.platz')[1].innerHTML !== 'RE') {
      continue;
    }
    const track = {place:parsePlace(e), interpret:parseInterpret(e), title:parseTitle(e)}
    tracks.push(track);
  }
  return tracks;
}

function parsePlace(e) {
  return e.querySelector(".platz").innerHTML;
}

function parseInterpret(e) {
  return e.querySelector(".info .interpret").innerHTML;
}

function parseTitle(e) {
  return e.querySelector(".info .titel").innerHTML;
}

function setTracks(tracks) {
  for(const t of tracks) {
    const row = tracksTable.insertRow(tracksTable.rows.length);
    row.addEventListener('dblclick', copy);
    const place = row.insertCell(0);
    const interpret = row.insertCell(1);
    const title = row.insertCell(2);
    place.innerHTML = t.place;
    interpret.innerHTML = t.interpret;
    title.innerHTML = t.title;
  }
}

function tracksToString() {
  var arr = new Array();
  for(var t of tracks) {
    arr.push(t.place + '. ' + raw(t.interpret) + ' - ' + raw(t.title));
  }
  return arr.join('\r\n');
}

function raw(text) {
  return text.replace(/(&amp;)/g, '&');
}
