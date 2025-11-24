class URLManager {
  constructor(url = window.location.href) {
    this.url = new URL(url);
  }
  
  getFullURL() {
    return this.url.href;
  }
  
  getParam(key) {
    return this.url.searchParams.get(key);
  }
  
  getAllParams() {
    const params = {};
    for (const [key, value] of this.url.searchParams) {
      params[key] = value;
    }
    return params;
  }
  
  getParamAll(key) {
    return this.url.searchParams.getAll(key);
  }
  
  hasParam(key) {
    return this.url.searchParams.has(key);
  }
  
  setParam(key, value) {
    this.url.searchParams.set(key, value);
    return this; // for chaining
  }
  
  setParams(params) {
    Object.entries(params).forEach(([key, value]) => {
      this.setParam(key, value);
    });
    return this;
  }
  
  appendParam(key, value) {
    this.url.searchParams.append(key, value);
    return this;
  }
  
  removeParam(key) {
    this.url.searchParams.delete(key);
    return this;
  }
  
  removeParams(keys) {
    keys.forEach(key => this.removeParam(key));
    return this;
  }
  
  clearParams() {
    this.url.search = '';
    return this;
  }
  
  updateBrowserURL(replace = false) {
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', this.url.href);
    return this;
  }
}

export default URLManager
