---
title: Publish DEV articles from a git repo, with Github + Pipedream
---

I wrote this article in VS Code, on my Mac, and published it with a simple `git push`.

I'll show you how easy this is to setup for your own posts, and you'll see what benefits you get managing posts locally.

## The short version

Take this Markdown:

```markdown
# My first post

Hello, world!
```

and push it to Github:

```bash
git add my-first-post.md
git commit -m "Adding first post"
git push
```

You'll see the article appear as a draft in your [DEV](https://dev.to) account.

**DRAFT PICTURE HERE**

Keep editing, `git push` again, and the draft will update. When you're ready to publish, add this to the top of your post:

```markdown
---
published: true
---
```

Then run:

```bash
git add my-first-post.md
git commit -m "Publishing first post"
git push
```

**PICTURE OF PUBLISHED POST**

How cool is that! Let's see how this works.

## How this works

To get started, you'll need a [Github](https://github.com) account and a [DEV API key](https://dev.to/settings/account).

[Create a new Github repo](https://github.com/new) to manage your DEV posts:

![dev.to posts Github repo title](https://dev-to-uploads.s3.amazonaws.com/i/kgmyzh4vf6xmj1tbpuj1.png)

Clone the repo locally:

```bash
git clone git@github.com:[YOUR_USERNAME]/dev-to-posts.git
```

Next, you'll configure a [Pipedream](https://pipedream.com) workflow to interact with the [DEV](https://dev.to) posts each time you `git push` to this repo.

Pipedream is an integration platform for developers. For this [dev.to](https://dev.to) flow, Pipedream works like Github Actions: each time you `git push`, your workflow runs. Pipedream workflows are written using [pre-built actions](https://docs.pipedream.com/workflows/steps/actions/#using-existing-actions) and custom Node.js code, and you can connect to hundreds of pre-built API integrations - you'll use the [dev.to](https://dev.to) integration here.

It's also easy to re-use existing Pipedream workflows. **Open this workflow** and click copy. Here, you'll be asked to sign up for a Pipedream account.

First, you'll be asked to configure the **trigger** step. This tells the workflow to run on every `git push` event in a specific repo. You'll just need to connect your Github account and select your repo from the dropdown menu:

**Image of connect your account flow**

**Dropdown menu**

Account connections are scoped to steps. You'll need to auth into your Github account and add your Dev.to API key in the necessary steps.

**Picture of Connect Account** steps.

## How images work

Currently, DEV does not have an API for uploading images, but I'm using [Cloudinary] to host my image, referencing the Cloudinary URL in my Markdown:

```markdown
![My image](./images/my-image.png)
```

In the future, you might be able to reference local images in your article Markdown

```markdown
![My image](./images/my-image.png)
```

Then once you commit the images to your repo, the Pipedream workflow would upload the images to DEV and change the article references to point to the hosted version, instead.

## `master` branch only

The workflow processes commits on the default repo branch only (`master`, unless you've changed it). Commits to other branches are ignored.

## One Markdown file : one post

Each Markdown file you push to your dev.to repo generates its own dev.to post. You can technically publish two posts with the same title and filename - dev.to does not prohibit this.

Your files must have a `.md` extension for them to be processed. Any non-Markdown files are ignored by the workflow.

## Unpublishing

You can unpublish dev.to posts by setting the YAML front matter `published` variable to `false`:

```markdown
---
published: false
---
```

Then run:

```bash
git add my-first-post.md
git commit -m "Unpublishing first post"
git push
```

## Front Matter

The Pipedream workflow uses the same YAML front matter [that dev.to supports](https://dev.to/p/editor_guide) to update the published state, title, tags, and more.

None of the front matter variables are required. If you include no front matter, your article will be saved to [dev.to](https://dev.to/) as a draft, with a title based on the filename (see below).

### Front Matter Variables

- `published`: `true` or `false`. Defaults to `false`, saving the article to dev.to in an unpublished state. Set to `true` to publish.
- `title`: a string, the title of the article.

### Titles

The `title` front matter variable is always used if present.

If `title` is absent, the workflow will use the filename of the article, converting hyphens and underscores as spaces. Case is preserved:

```
my-first-post.md -> my first post
My_First_Post.md -> My First Post
My First Post.md -> My First Post
```

If you rely on this convention and then later want to set the `title` front matter variable, the workflow will update the title according to the variable's value, and use that instead of the filename moving forward.
