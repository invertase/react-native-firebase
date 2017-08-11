# Storage

RNFirebase mimics the [Web Firebase SDK Storage](https://firebase.google.com/docs/storage/web/start), whilst
providing some iOS and Android specific functionality.

## Uploading files

### Simple

```javascript
firebase.storage()
    .ref('/files/1234')
    .putFile('/path/to/file/1234')
    .then(uploadedFile => {
        //success
    })
    .catch(err => {
        //Error
    });
```


### With metadata

```javascript
const metadata = {
    contentType: 'image/jpeg'
}
firebase.storage()
    .ref('/files/1234')
    .putFile('/path/to/file/1234', metadata)
```

### Listen to upload state

```javascript
const unsubscribe = firebase.storage()
                        .ref('/files/1234')
                        .putFile('/path/to/file/1234')
                        .on('state_changed', snapshot => {
                            //Current upload state
                        }, err => {
                            //Error
                            unsubscribe();
                        }, uploadedFile => {
                            //Success
                            unsubscribe();
                        });
```

## Downloading files

### Simple

```javascript
firebase.storage()
    .ref('/files/1234')
    .downloadFile('/path/to/save/file')
    .then(downloadedFile => {
        //success
    })
    .catch(err => {
        //Error
    });
```

### Listen to download state

```javascript
const unsubscribe = firebase.storage()
                        .ref('/files/1234')
                        .downloadFile('/path/to/save/file')
                        .on('state_changed', snapshot => {
                            //Current download state
                        }, err => {
                            //Error
                            unsubscribe();
                        }, downloadedFile => {
                            //Success
                            unsubscribe();
                        });
```

## TODO

There are a few methods which have not yet been implemented for Storage:

### Reference
- put()
- putString()

### UploadTask
- cancel()
- pause()
- resume()

### DownloadTask
- cancel()
- pause()
- resume()
