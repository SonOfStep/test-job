const BASE_URL = "https://jsonplaceholder.typicode.com/posts";

class Pagination {
  constructor() {
    if (typeof Pagination.instance === "object") {
      return Pagination.instance;
    }
    this.count = null;
    this.limit = 10;
    this.page = 1;
    Pagination.instance = this;
    return this;
  }

  nextPage() {
    return ++this.page;
  }
  prevPage() {
    if (this.page !== 1) {
      return --this.page;
    } else {
      return this.page;
    }
  }

  get isFirstPage() {
    return this.page === 1;
  }

  get isLastPage() {
    return Math.ceil(this.count / this.limit) === this.page;
  }
}

const deletedPosts = [];

async function getCount({ url }) {
  try {
    const response = await fetch(`${url}?_limit=0`);
    const count = response.headers.get("x-total-count");
    return count;
  } catch (error) {
    throw new Error(error.name + ": " + error.message);
  }
}

async function fetchPosts({ url, limit = 10, page = 1, search }) {
  try {
    const response = await fetch(
      `${url}?_limit=${limit}&_page=${page}${search ? "&q=" + search : ""}${
        deletedPosts.length ? "&id_ne=" + deletedPosts.join(",") : ""
      }`
    );
    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(error.name + ": " + error.message);
  }
}

function createPostElement(post) {
  const container = document.createElement("div");
  container.setAttribute("id", `post-${post.id}`);
  container.classList.add("post");

  const title = document.createElement("h4");
  title.classList.add("post__title");
  title.innerText = post.title;

  const body = document.createElement("p");
  body.classList.add("post__body");
  body.innerText = post.body;

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add(...["post__remove", "btn"]);
  deleteBtn.innerText = "Delete";

  deleteBtn.addEventListener("click", () => {
    deletedPosts.push(post.id);
    container.remove();
  });

  container.append(...[title, body, deleteBtn]);

  return container;
}

async function renderPosts(posts = []) {
  const conatinerPosts = document.getElementById("posts");
  const ElemsPosts = posts.map((post) => createPostElement(post));

  conatinerPosts.innerHTML = "";
  conatinerPosts.append(...ElemsPosts);
}

(() => {
  const nextPageButton = document.getElementById("next");
  const prevPageButton = document.getElementById("prev");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search");

  document.addEventListener("DOMContentLoaded", async (event) => {
    const posts = await fetchPosts({ url: BASE_URL });
    if (new Pagination().count === null) {
      new Pagination().count = await getCount({ url: BASE_URL });
    }

    renderPosts(posts);
  });

  prevPageButton.addEventListener("click", async () => {
    if (new Pagination().isFirstPage) return;

    const posts = await fetchPosts({
      url: BASE_URL,
      page: new Pagination().prevPage(),
    });

    renderPosts(posts);
  });

  nextPageButton.addEventListener("click", async () => {
    if (new Pagination().isLastPage) return;
    const posts = await fetchPosts({
      url: BASE_URL,
      page: new Pagination().nextPage(),
    });

    renderPosts(posts);
  });

  searchInput.addEventListener("input", async (event) => {
    const posts = await fetchPosts({
      url: BASE_URL,
      search: event.currentTarget.value,
    });
    renderPosts(posts);
  });

  searchForm.addEventListener("reset", async (e) => {
    if (document.getElementById("search").value === "") e.preventDefault();

    const posts = await fetchPosts({
      url: BASE_URL,
      limit: new Pagination().limit,
      page: new Pagination().page,
    });
    renderPosts(posts);
  });
})();
