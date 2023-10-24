const books = [];
const RENDER_EVENT = "render_book";
const SAVED_EVENT = "saved_book";
const STORAGE_KEY = "book_apps";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  const searchBookForm = document.getElementById("searchSubmit");
  const spanText = document.querySelector("#bookSubmit span");
  const readStatusCheckbox = document.getElementById("inputBookIsComplete");

  readStatusCheckbox.addEventListener("change", function () {
    if (readStatusCheckbox.checked) {
      spanText.textContent = "Selesai dibaca";
    } else {
      spanText.textContent = "Belum selesai dibaca";
    }
  });

  submitForm.addEventListener("submit", function (event) {
    addBook();
    event.preventDefault();
  });
  searchBookForm.addEventListener("click", function (event) {
    searchBookForForm();
    event.preventDefault();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const notYetFinishedReading = document.getElementById(
    "incompleteBookshelfList"
  );
  notYetFinishedReading.innerHTML = "";

  const finishedReading = document.getElementById("completeBookshelfList");
  finishedReading.innerHTML = "";

  books.reduce((container, bookItem) => {
    const bookElement = makeBook(bookItem);
    bookItem.isComplete
      ? finishedReading.append(bookElement)
      : notYetFinishedReading.append(bookElement);
    return container;
  }, null);
});

function isStorageExist() {
  if (typeof Storage === "undefined")
    return alert("Browser kamu tidak mendukung local storage"), false;
  return true;
}

function searchBookForForm() {
  const search = document.getElementById("searchBookTitle").value.toLowerCase();
  const dataItem = document.querySelectorAll("article");
  dataItem.forEach((value) => {
    const title = value.firstElementChild.textContent.toLowerCase();
    value.style.display = title.includes(search) ? "block" : "none";
  });
}

function addBook() {
  const titleBok = document.getElementById("inputBookTitle").value;
  const authorBook = document.getElementById("inputBookAuthor").value;
  const yearBook = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete");

  let statusFinished = isComplete.checked ? true : false;

  const newBook = {
    id: +new Date(),
    title: titleBok,
    author: authorBook,
    year: Number(yearBook),
    isComplete: statusFinished,
  };
  books.push(newBook);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(book) {
  const article = document.createElement("article");
  article.classList.add("book_item");

  const textTitle = document.createElement("h2");
  textTitle.innerText = `Judul: ${book.title}`;

  const author = document.createElement("p");
  author.innerText = `Author: ${book.author}`;

  const year = document.createElement("p");
  year.innerText = `Year: ${book.year}`;

  const action = document.createElement("div");
  action.classList.add("action");

  article.appendChild(textTitle);
  article.appendChild(author);
  article.appendChild(year);
  if (book.isComplete) {
    const btnNotFinished = document.createElement("button");
    const btnRemove = document.createElement("button");
    const btnEdit = document.createElement("button");
    btnNotFinished.classList.add("green");
    btnNotFinished.innerText = "Belum selesai di Baca";

    btnNotFinished.addEventListener("click", function () {
      notFinishedReading(book.id);
    });
    btnRemove.classList.add("red");
    btnRemove.innerText = "Hapus Buku";
    btnRemove.addEventListener("click", function () {
      const confirmDelete = confirm(
        `Apakah Anda yakin ingin menghapus book ${book.title} ini?`
      );
      if (confirmDelete) {
        removeBook(book.id);
      }
    });
    btnEdit.classList.add("yellow");
    btnEdit.innerText = `Edit buku ${book.title}`;
    btnEdit.addEventListener("click", function () {
      openEditDialog(book.id);
    });
    action.appendChild(btnNotFinished);
    action.appendChild(btnRemove);
    action.appendChild(btnEdit);
    article.appendChild(action);
  } else {
    const btnFinished = document.createElement("button");
    const btnRemoved = document.createElement("button");
    const btnEdit = document.createElement("button");
    btnFinished.classList.add("green");
    btnFinished.innerText = "Selesai dibaca";
    btnFinished.addEventListener("click", function () {
      finishedReading(book.id);
    });
    btnRemoved.classList.add("red");
    btnRemoved.innerText = "Hapus Buku";
    btnRemoved.addEventListener("click", function () {
      const confirmDelete = confirm(
        `Apakah anda ingin menghapus book ${book.title} ini ?`
      );
      if (confirmDelete) {
        removeBook(book.id);
      }
    });
    btnEdit.classList.add("yellow");
    btnEdit.innerText = `Edit buku ${book.title}`;
    btnEdit.addEventListener("click", function () {
      openEditDialog(book.id);
    });
    action.appendChild(btnFinished);
    action.appendChild(btnRemoved);
    action.appendChild(btnEdit);
    article.appendChild(action);
  }
  article.setAttribute("id", `book-${book.id}`);

  return article;
}
function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  books.splice(bookTarget, 1);
  if (bookTarget === -1) return;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function finishedReading(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = true;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function notFinishedReading(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
    return null;
  }
}
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data != null) {
    data.forEach((book) => books.push(book));
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}
function openEditDialog(bookId) {
  const bookToEdit = books.find((book) => book.id === bookId);

  if (bookToEdit) {
    const editedTitle = prompt("Edit Judul: ", bookToEdit.title);
    const editedAuthor = prompt("Edit Author: ", bookToEdit.author);
    const editedYear = prompt("Edit Tahun: ", bookToEdit.year);
    const isFinishedCheckbox = confirm(
      "Tandai buku ini sebagai selesai dibaca ?"
    );

    if (editedTitle !== null) {
      bookToEdit.title = editedTitle;
    }
    if (editedAuthor !== null) {
      bookToEdit.author = editedAuthor;
    }
    if (editedYear !== null) {
      bookToEdit.year = parseInt(editedYear);
    }
    bookToEdit.isComplete = isFinishedCheckbox;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}
