import axios from 'axios';

export default class ImagesApiServer {
  constructor() {
    this.searchQuery = '';
    this.page = 0;
    this.pageSize = 40;
  }
  async fetchImage() {
    this.incrementPage();
    const BASE_URL = 'https://pixabay.com/api/';
    const API_KEY = '28875858-be00e402ceba03ed1852ded5b';
    const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(
      this.searchQuery
    )}&image_type=photo&orientation=horizontal&safesearch=true&page=${
      this.page
    }&per_page=${this.pageSize}`;

    try {
      const images = await axios.get(url);
      return images.data;
    } catch (error) {
      throw new Error('Sorry, something goes wrong.');
    }
  }
  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 0;
  }
  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
