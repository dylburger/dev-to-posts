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

You'll see the article appear as a draft in your DEV account.

![My first draft article](https://res.cloudinary.com/dkbxegavp/image/upload/v1590355743/dev.to%20posts/dev-to-draft_bmqlgb.png)

Keep editing, `git push` again, and the draft will update. When you're ready to publish, add this to the top of your post:

```markdown
---
published: true
---

# My first post

Hello, world!
```

Then run:

```bash
git add my-first-post.md
git commit -m "Publishing first post"
git push
```

and your brand new article is published to DEV:

![My first article, published](https://res.cloudinary.com/dkbxegavp/image/upload/v1590356175/dev.to%20posts/dev-published-article_sjkyvn.png)

How cool is that! Let's see how this works.

## How this works

To get started, you'll need a [Github](https://github.com) account and a [DEV API key](https://dev.to/settings/account).

[Create a new Github repo](https://github.com/new) to manage your DEV posts:

![DEV posts Github repo title](https://dev-to-uploads.s3.amazonaws.com/i/kgmyzh4vf6xmj1tbpuj1.png)

Clone the repo locally:

```bash
git clone git@github.com:[YOUR_USERNAME]/dev-to-posts.git
```

Next, you'll configure a [Pipedream](https://pipedream.com) workflow to interact with the DEV posts each time you `git push` to this repo.

Pipedream is an integration platform for developers. For this DEV flow, Pipedream works like Github Actions: each time you `git push`, your workflow runs. Pipedream workflows are written using [pre-built actions](https://docs.pipedream.com/workflows/steps/actions/#using-existing-actions) and custom Node.js code, and you can connect to hundreds of pre-built API integrations - you'll use the DEV integration here.

It's also easy to re-use existing Pipedream workflows. **Open this workflow** and click copy. Here, you'll be asked to sign up for a Pipedream account.

First, you'll be asked to configure the **trigger** step. This tells the workflow to run on every `git push` event in a specific repo. You'll just need to connect your Github account and select your repo from the dropdown menu:

**Image of connect your account flow**

**Dropdown menu**

Account connections are scoped to steps. You'll need to auth into your Github account and add your DEV API key in the necessary steps.

**Picture of Connect Account** steps.

## How images work

Currently, DEV doesn't have an API for uploading images, but I'm using [Cloudinary](https://cloudinary.com/) to host mine, referencing the Cloudinary URL in my Markdown:

```markdown
![My image](https://res.cloudinary.com/dkbxegavp/image/upload/v1590355743/dev.to%20posts/dev-to-draft_bmqlgb.png)
```

In the future, you might be able to reference local images in your article Markdown

```markdown
![My image](./images/my-image.png)
```

Then once you commit the images to your repo, the Pipedream workflow would upload the images to DEV and change the article references to point to the hosted version, instead.

In fact, the Pipedream workflow you copied above is yours to modify. **You can add any logic you'd like to that workflow, uploading images to Cloudinary or another hosting provider, or include anything else custom to your publishing process**.

## Default branch only

The workflow processes commits on the default repo branch only (`master`, unless you've changed it). Commits to other branches are ignored.

## One Markdown file : one post

Each Markdown file you push to your DEV repo generates its own DEV post. Your files must have a `.md` extension for them to be processed. Any non-Markdown files are ignored by the workflow.

## Unpublishing

You can unpublish DEV posts by setting the YAML front matter `published` variable to `false`:

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

The Pipedream workflow uses the same YAML front matter [that DEV supports](https://dev.to/p/editor_guide) to update the published state, title, tags, and more.

None of the front matter variables are required. If you include no front matter, your article will be saved to DEV as a draft, with a title based on the filename (see below).

### Front Matter Variables

- `published`: `true` or `false`. Defaults to `false`, saving the article to DEV in an unpublished state. Set to `true` to publish.
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
