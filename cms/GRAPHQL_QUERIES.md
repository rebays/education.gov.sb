# GraphQL Queries for Resource Library Testing

**Base URL:** `http://127.0.0.1:8000/graphql/`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

---

## Query 1: Get Resource Library Root with Top-Level Folders

Use this to see what categories/sections are available.

```graphql
query GetLibraryRoot {
  resourceLibraryRoot {
    id
    name
    slug
    description
    order
    fileCount
    children {
      id
      name
      slug
      description
      resourceType
      order
      fileCount
      children {
        id
        name
        slug
        fileCount
      }
    }
    resources {
      id
      displayLabel
      filename
      office
      publishedDate
      pages
    }
  }
}
```

**What this returns:**
- Root folder with its immediate children (top-level categories)
- Each child's name, slug, file count, and its own children (second level)
- Any files directly in the root (unlikely)

---

## Query 2: Get a Specific Folder by Path

Use this to navigate into any folder in the hierarchy.

```graphql
query GetFolderByPath($path: String!) {
  resourceFolder(path: $path) {
    id
    name
    slug
    description
    resourceType
    revisionDate
    order
    fileCount
    children {
      id
      name
      slug
      description
      order
      fileCount
    }
    resources {
      id
      label
      displayLabel
      url
      filename
      fileExtension
      isVideo
      fileSize
      language
      office
      publishedDate
      pages
    }
  }
}
```

**Variables:**
```json
{
  "path": "primary/year-1/english"
}
```

**Example paths to try:**
- `"primary"` - browse Primary level
- `"primary/year-1"` - browse Year 1 within Primary
- `"primary/year-1/english"` - browse English resources in Year 1 Primary
- `"policies"` - browse any top-level folder
- `""` - returns root folder

---

## Query 3: Get Root Folder (Simplified)

Minimal query to just see the structure:

```graphql
query {
  resourceLibraryRoot {
    name
    children {
      name
      slug
      fileCount
      children {
        name
        slug
        fileCount
      }
    }
  }
}
```

---

## Query 4: Get Resources in a Specific Folder (No Subfolders)

Just the files in one folder:

```graphql
query GetFolderResources($path: String!) {
  resourceFolder(path: $path) {
    name
    fileCount
    resources {
      id
      displayLabel
      filename
      fileExtension
      fileSize
      url
      office
      publishedDate
      pages
      language
    }
  }
}
```

**Variables:**
```json
{
  "path": "primary/year-1/english"
}
```

---

## Query 5: Browse Full Hierarchy (Deep)

See entire tree structure up to 4 levels deep:

```graphql
query {
  resourceLibraryRoot {
    id
    name
    children {
      id
      name
      slug
      fileCount
      children {
        id
        name
        slug
        fileCount
        children {
          id
          name
          slug
          fileCount
          resources {
            id
            displayLabel
            filename
          }
        }
      }
    }
  }
}
```

---

## How to Test in Postman

1. **Create a new POST request** to `http://127.0.0.1:8000/graphql/`

2. **Set Headers:**
   - Key: `Content-Type`
   - Value: `application/json`

3. **Set Body** (raw, JSON):
   ```json
   {
     "query": "PASTE_QUERY_HERE",
     "variables": {
       "path": "your-path-here"
     }
   }
   ```

4. **Replace PASTE_QUERY_HERE** with one of the queries above (without the outer `query` word)

5. **Example full body** for Query 2:
   ```json
   {
     "query": "query GetFolderByPath($path: String!) { resourceFolder(path: $path) { id name slug description resourceType revisionDate order fileCount children { id name slug description order fileCount } resources { id label displayLabel url filename fileExtension isVideo fileSize language office publishedDate pages } } }",
     "variables": {
       "path": "primary/year-1/english"
     }
   }
   ```

---

## Field Descriptions

### ResourceFolder Fields
- `id` - Database ID
- `name` - Folder name (e.g., "Primary", "Year 1", "English")
- `slug` - URL-safe version of name
- `description` - Folder description/summary
- `resourceType` - Type (policy, form, report, circular, curriculum, video, other)
- `revisionDate` - Date of last revision
- `order` - Custom sort order (0 = default alphabetical)
- `fileCount` - Number of direct files in this folder
- `children` - Immediate child folders (sorted by order, then name)
- `resources` - Direct files in this folder

### Resource (File) Fields
- `id` - File database ID
- `label` - Display name/label
- `displayLabel` - Label or filename (falls back to filename if no label)
- `url` - Direct download URL
- `filename` - Original filename
- `fileExtension` - File extension (pdf, docx, mp4, etc.)
- `isVideo` - Boolean, true for video files
- `fileSize` - Size in bytes
- `language` - ISO language code (en, fr, etc.)
- `office` - Publishing organization/office
- `publishedDate` - Publication date (optional)
- `pages` - Number of pages (for documents, optional)

---

## Expected Responses

### Success Response
```json
{
  "data": {
    "resourceLibraryRoot": {
      "name": "Resource Library",
      "children": [
        {
          "name": "Primary",
          "slug": "primary",
          "fileCount": 0,
          "children": [...]
        }
      ]
    }
  }
}
```

### Error Response (Folder not found)
```json
{
  "data": {
    "resourceFolder": null
  }
}
```

### GraphQL Error
```json
{
  "errors": [
    {
      "message": "Error message here",
      "locations": [...],
      "path": [...]
    }
  ]
}
```

---

## Testing Checklist

- [ ] Query 1 works - see root folder and top-level folders
- [ ] Query 2 works - navigate to a specific folder by path
- [ ] Can access files in folders - download URL is valid
- [ ] New fields show up:
  - [ ] `order` on folders
  - [ ] `office` on files
  - [ ] `publishedDate` on files
  - [ ] `pages` on files
- [ ] Folder hierarchy traversal works (any depth)
- [ ] Empty folders return null for `resourceFolder` when path doesn't exist
