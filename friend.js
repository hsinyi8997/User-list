const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users";
const SHOW_URL = BASE_URL + "/api/v1/users/";

const friends = JSON.parse(localStorage.getItem('favorite'))
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modal = document.querySelector('#user-modal')
const USER_PER_PAGE = 12
const userData = [];
let page = 1


//以下為函式區
//主頁面渲染
function renderUserData(data) {
  let dataHTML = "";
  data.forEach((item) => {
    dataHTML += `
    <div class="col-sm-3 mt-1">
      <div class="mb-3">
        <div class="card btn-show-more pt-3 pb-5" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
          <img src="${item.avatar}" alt="User Photo" class="rounded-circle w-75">
          <h5 class="card-title">${item.surname} ${item.name}</h5>
        </div>
      </div>
    </div>
    `;
  });
  dataPanel.innerHTML = dataHTML;
}

//Modal顯示user info 
function showUserModal(id) {
  const modalName = document.querySelector("#user-modal-name");
  const modalImage = document.querySelector("#user-modal-image");
  const modalGender = document.querySelector("#user-modal-gender");
  const modalAge = document.querySelector("#user-modal-age");
  const modalRegion = document.querySelector("#user-modal-region");
  const modalBirth = document.querySelector("#user-modal-birth");
  const modalEmail = document.querySelector("#user-modal-email");
  const modalBtn = document.querySelector('#user-modal-btn')
  axios.get(SHOW_URL + id).then((response) => {
    const data = response.data;
    modalName.innerText = data.surname + data.name;
    modalImage.innerHTML = `
    <img src="${data.avatar}" class="card-img-top" alt="User Photo">
    `;
    modalGender.innerText = "Gender: " + data.gender;
    modalAge.innerText = "Age: " + data.age;
    modalRegion.innerText = "Region: " + data.region;
    modalBirth.innerText = "Birth: " + data.birthday;
    modalEmail.innerText = "Email: " + data.email;

    modalBtn.innerHTML =`
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    <button type="button" class="btn btn-danger btn-remove-favorite" data-dismiss="modal" data-id="${data.id}">Delete</button>
    `
  });
}

//從Favorite清單中移除
function removeFromFavorite(id) {
  if(!friends) return
  const friendsIndex = friends.findIndex((user) => user.id === id)
  if(friendsIndex === -1) return
  const friend = friends.find((user) => user.id === id)

  if (confirm('Are you going to remove ' + friend.name + " from your favorite?")){
    friends.splice(friendsIndex, 1)
    localStorage.setItem('favorite', JSON.stringify(friends))
    if(friends.length % USER_PER_PAGE === 0) {
      page -= 1
      renderPaginator(friends.length)
      renderUserData(getUsersByPage(page))
      renderPageActive(page)
    } else {
      renderPaginator(friends.length)
      renderUserData(getUsersByPage(page))
      renderPageActive(page)
    }
  }
}

//分頁器渲染
function renderPaginator(amount) {
  const totalPage = Math.ceil(amount / USER_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= totalPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
  renderPageActive(page)
}

//將所在頁面新增class"active"
function renderPageActive (page) {
  const pageAmount = paginator.childElementCount
  for(let allPage = 0; allPage < pageAmount; allPage++) {
    paginator.children[allPage].classList.remove('active')
  } 
  const pageIndex = page - 1
  paginator.children[pageIndex].classList.add('active')
}

//取得個別分頁資料
function getUsersByPage(page) {
  const startIndex = (page - 1) * USER_PER_PAGE
  return friends.slice(startIndex, startIndex + USER_PER_PAGE)
}

//以下為監聽器
//主頁面監聽，顯示Modal取得user info
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.parentElement.matches(".btn-show-more")) {
    showUserModal(Number(event.target.parentElement.dataset.id));
  }
});

//在Modal內設置監聽器，確認移除好友
modal.addEventListener('click', function onModalClicked(event) {
  if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

//分頁監聽器，渲染user點選之特定頁數
paginator.addEventListener('click', function onPageClicked(event) {
  if (event.target.tagName !== 'A') return

  page = Number(event.target.dataset.page)
  renderUserData(getUsersByPage(page))
  renderPageActive(page)
})

//Favorite初始頁面渲染
renderUserData(getUsersByPage(1))
renderPaginator(friends.length)
