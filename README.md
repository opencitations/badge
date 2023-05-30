#The OpenCitations Badge
Add the OpenCitations Badge to your webpage to display information regarding a given entity.

## Quick example
To view the **number of citations** for a the document with DOI=**10.1097/dmp.0b013e31819d977c**, all you need to do is adding the following code anywhere in your HTML page:

```
<script src="https://cdn.jsdelivr.net/gh/opencitations/badge@v1.0.0/badge.js" data-type="doi" data-value="10.1097/dmp.0b013e31819d977c" data-return="citation-count"></script>

```

## Usage
Add a `<script>` construct anywhere in your HTML webpage and specify the following attributes:

* **src** with the value **"https://cdn.jsdelivr.net/gh/opencitations/badge@v[VERSION]/badge.js"**, Replace **[VERSION]** with the release version you are willing to use.
* **data-type** the type of the entity given as input. Check the values supported by the release you are using. E.g. v1.0.0 supports only the **"doi"** value.
* **data-value** the value of the entity given as input. E.g. if `data-type = "doi"` the value could be **"10.1097/dmp.0b013e31819d977c"**
* **data-return** the information we want to get back from OpenCitations. Check the values supported by the release you are using. E.g. v1.0.0 supports only the **"citation-count"** value. **Note:** check the expected input of the data you are willing to return.
* **data-style** the style of the badge. Check the styles supported by the release you are using.
* **(Optional) data-id** you need to specify an id to the add `<script>` in case you want to add more than one OpenCitations Badge in the same webpage.
