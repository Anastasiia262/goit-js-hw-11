import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ImagesApiServer from './js/search-picture';
import SimpleLightbox from 'simplelightbox';
import '../node_modules/simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchInput: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const imagesApiServer = new ImagesApiServer();

function appendImagesToGallery(images) {
  const galleryItem = images
    .map(image => {
      return `
      <div class="photo-card">
      <a href="${image.largeImageURL}">
    <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
    </a>
    <div class="info">
    <p class="info-item">
    <b>Likes</b> ${image.likes}
    </p>
    <p class="info-item">
    <b>Views</b> ${image.views}
    </p>
    <p class="info-item">
    <b>Comments</b> ${image.comments}
    </p>
    <p class="info-item">
    <b>Downloads</b> ${image.downloads}
    </p>
    </div>
    </div>
    `;
    })
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', galleryItem);
}
let ligthdoxGallery = new SimpleLightbox('.gallery a');

function clearGalleryEl() {
  refs.gallery.innerHTML = '';
}

async function getImages() {
  const images = await imagesApiServer.fetchImage();
  appendImagesToGallery(images.hits);
  refs.loadMoreBtn.classList.remove('is-hidden');
  ligthdoxGallery.refresh();
  return images;
}

function scroll() {
  const { page, pageSize } = imagesApiServer;
  const targetItemIndex = (page - 1) * pageSize;
  const targetItem = refs.gallery.children.item(targetItemIndex);
  const padding = 15;
  const currentScrollTop = document.scrollingElement.scrollTop;
  const targetItemScreenOffsetTop = targetItem.getBoundingClientRect().top;

  window.scroll({
    top: currentScrollTop + targetItemScreenOffsetTop - padding,
    behavior: 'smooth',
  });
}
async function onFormSubmit(e) {
  e.preventDefault();
  const inputValue = e.currentTarget.elements.searchQuery.value;

  imagesApiServer.query = inputValue;
  imagesApiServer.resetPage();
  clearGalleryEl();
  refs.loadMoreBtn.classList.add('is-hidden');
  try {
    const images = await getImages();

    if (images.hits.length === 0) {
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    scroll();
    Notify.success(`"Hooray! We found ${images.totalHits} images."`);
  } catch (error) {
    Notify.failure(error.message);
    throw error;
  }
}

async function loadMoreImages() {
  const images = await getImages();
  scroll();

  if (images.hits.length < imagesApiServer.pageSize) {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

refs.searchInput.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', loadMoreImages);