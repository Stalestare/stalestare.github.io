const fileInput = document.getElementById('fileInput');
const bookViewer = document.getElementById('bookViewer');
const notesArea = document.getElementById('notes');
const submitBtn = document.getElementById('submitBtn');

// Handle file upload
fileInput.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;

  const extension = file.name.split('.').pop().toLowerCase();

  switch (extension) {
    case 'txt':
      handleTxt(file);
      break;
    case 'pdf':
      handlePdf(file);
      break;
    case 'epub':
      handleEpub(file);
      break;
    default:
      bookViewer.innerHTML = '<p>Unsupported file format.</p>';
  }
});

// Handle plain text files
function handleTxt(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    bookViewer.textContent = e.target.result;
  };
  reader.readAsText(file);
}

// Handle PDF files using PDF.js
function handlePdf(file) {
  const reader = new FileReader();
  reader.onload = function () {
    const typedArray = new Uint8Array(reader.result);

    pdfjsLib.getDocument({ data: typedArray }).promise.then(pdf => {
      let html = '';
      const numPages = Math.min(pdf.numPages, 5); // Only load first 5 pages for performance

      const loadPages = async () => {
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const strings = textContent.items.map(item => item.str).join(' ');
          html += `<p>${strings}</p>`;
        }
        bookViewer.innerHTML = html;
      };

      loadPages();
    }).catch(err => {
      console.error(err);
      bookViewer.innerHTML = '<p>Failed to load PDF.</p>';
    });
  };
  reader.readAsArrayBuffer(file);
}

// Handle EPUB files using epub.js
function handleEpub(file) {
  bookViewer.innerHTML = ''; // Clear previous content

  const book = ePub(file);
  const rendition = book.renderTo(bookViewer, {
    width: '100%',
    height: '600px',
    flow: 'paginated',
  });

  rendition.display();
}

// Placeholder for review submission logic
submitBtn.addEventListener('click', () => {
  const userReview = notesArea.value.trim();

  if (userReview === '') {
    alert('Please write something before submitting.');
    return;
  }

  // For now, just show a confirmation
  alert("Review submitted! (In real life, this would save to a database.)");

  // Reset text area
  notesArea.value = '';
});
