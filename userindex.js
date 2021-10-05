const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users";
const SHOW_URL = BASE_URL + "/api/v1/users/";

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modal = document.querySelector('#user-modal')
const USER_PER_PAGE = 24
const userData = [];
const list = JSON.parse(localStorage.getItem('favorite')) || []
let filterUserData = []

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

//Modal顯示user info & 顯示新增或移除好友按鈕
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


    if (checkWhetherInList(id)) {
    modalBtn.innerHTML = `
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    <button type="button" class="btn btn-primary btn-add-favorite" data-dismiss="modal" data-id="${data.id}">Add to favorite</button>
    `
    } else {
    modalBtn.innerHTML = `
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    <button type="button" class="btn btn-danger btn-remove-favorite" data-dismiss="modal" data-id="${data.id}">Remove from favorite</button>
    `
    }

  });
}

//確認該user是否已被加入Favorite清單
function checkWhetherInList(id) {
  const user = list.find((user) => user.id === id)

  if(!user) {
    return true
  }else {
    return false
  }
}

//新增至Favorite清單
function addToFavorite(id) {
  const friend = userData.find((user) => user.id === id)
  if(list.some((user) => user.id === id)) {
    return alert('This is user has been added to your favorite list!')
  }

  list.push(friend)
  localStorage.setItem('favorite', JSON.stringify(list))
  alert( friend.name + ' is added to your favorite.')
}

//分頁器渲染
function renderPaginator(amount) {
  const totalPage = Math.ceil(amount / USER_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= totalPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
  currentPageBtn = paginator.firstElementChild
  currentPageBtn.classList.add('active')
}

//取得個別分頁資料
function getUsersByPage (page) {
  const data = filterUserData.length ? filterUserData : userData
  const startIndex = (page - 1) * USER_PER_PAGE
  return data.slice(startIndex, startIndex + USER_PER_PAGE)
}

//將Favorite清單中的user移除
function removeFromFavorite(id) {
  if (!list) return
  const friendsIndex = list.findIndex((user) => user.id === id)
  const friend = list.find((user) => user.id === id)
  if (friendsIndex === -1) return

  if(confirm('Are you going to remove ' + friend.name + " from your favorite?")){
  list.splice(friendsIndex, 1)
  localStorage.setItem('favorite', JSON.stringify(list))
  }
}

//以下為監聽器
//主頁面監聽，顯示Modal取得user info
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.parentElement.matches(".btn-show-more")) {
    showUserModal(Number(event.target.parentElement.dataset.id));
  }
});

//在Modal內設置監聽器，確認新增或移除好友
modal.addEventListener('click', function onModalClicked(event) {
  if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

//搜尋功能，可逐字監聽顯示搜尋結果
searchForm.addEventListener('input', function onSearchFormSubmitted(event) {
  const keyword = searchInput.value.trim().toLowerCase()
  filterUserData = userData.filter(user => (user.name + user.surname).toLowerCase().includes(keyword))

    if(filterUserData.length === 0) {
    return alert('Can not find people with name: ' + keyword)
  }

  renderUserData(getUsersByPage(1))
  renderPaginator(filterUserData.length)
})

//分頁監聽器，渲染user點選之特定頁數
paginator.addEventListener('click', function onPageClicked(event) {
  if (event.target.tagName !== 'A') return

  currentPageBtn.classList.remove('active') 
  const page = Number(event.target.dataset.page)
  renderUserData(getUsersByPage(page))

  currentPageBtn = event.target.parentElement 
  currentPageBtn.classList.add('active')
})


//初始主頁畫面
axios.get(INDEX_URL).then((response) => {
  userData.push(...response.data.results);
  renderUserData(getUsersByPage(1));
  renderPaginator(userData.length)
});