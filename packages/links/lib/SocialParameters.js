export default class SocialParameters {
  constructor(link) {
    this._link = link;
  }

  setDescriptionText(descriptionText) {
    this._descriptionText = descriptionText;
    return this._link;
  }

  setImageUrl(imageUrl) {
    this._imageUrl = imageUrl;
    return this._link;
  }

  setTitle(title) {
    this._title = title;
    return this._link;
  }

  build() {
    return {
      descriptionText: this._descriptionText,
      imageUrl: this._imageUrl,
      title: this._title,
    };
  }
}
