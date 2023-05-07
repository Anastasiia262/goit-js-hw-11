import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ImagesApiServer from './js/search-picture';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchInput: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const imagesApiServer = new ImagesApiServer();

function appendImagesToGallery(images) {
  const galleryItem = images
    .map((image) => {
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

let lightboxGallery = new SimpleLightbox('.gallery a');

function clearGalleryEl() {
  refs.gallery.innerHTML = '';
}

async function getImages() {
  const images = await imagesApiServer.fetchImage();
  appendImagesToGallery(images.hits);
  refs.loadMoreBtn.classList.remove('is-hidden');
  lightboxGallery.refresh();
  return images;
}

function scroll() {
  const { page, pageSize } = imagesApiServer;
  const targetItemIndex = (page - 1) * pageSize;
  const targetItem = refs.gallery.children.item(targetItemIndex);
  const padding = 15;
  const currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const targetItemScreenOffsetTop = targetItem.getBoundingClientRect().top;

  window.scrollTo({
    top: currentScrollTop + targetItemScreenOffsetTop - padding,
    behavior: 'smooth',
  });
}

async function onFormSubmit(e) {
  e.preventDefault();
  const inputValue = e.currentTarget.elements.searchQuery.value.trim();
  let images;
  if (!inputValue) {
    refs.loadMoreBtn.classList.add('is-hidden');
    return;
  }
  
  if (refs.gallery.innerHTML) {
    refs.loadMoreBtn.classList.remove('is-hidden');
  } else {
    refs.loadMoreBtn.classList.add('is-hidden');
  }

  imagesApiServer.query = inputValue;
  imagesApiServer.resetPage();
  clearGalleryEl();
  try {
    images = await getImages();

    if (images.hits.length === 0) {
      refs.loadMoreBtn.classList.add('is-hidden');
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    scroll();
    Notify.success(`Hooray! We found ${images.totalHits} images.`);
  } catch (error) {
    Notify.failure(error.message);
    throw error;
  }
  
  if (images.hits.length < imagesApiServer.pageSize) {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notify.failure("We're sorry, but you've reached the end of search results.");
  } else if (refs.loadMoreBtn.classList.contains('is-hidden')) {
    refs.loadMoreBtn.classList.remove('is-hidden');
  }
}


refs.searchInput.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', loadMoreImages);

async function loadMoreImages() {
  imagesApiServer.incrementPage();
  const images = await getImages();

  if (images.hits.length < imagesApiServer.pageSize) {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notify.failure("We're sorry, but you've reached the end of search results.");
  }
}