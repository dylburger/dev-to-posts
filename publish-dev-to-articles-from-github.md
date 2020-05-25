---
title: Publish DEV articles from a git repo, with Github + Pipedream
---

I wrote this article in VS Code, and published it with `git push`. [This Pipedream workflow](https://pipedream.com/@dylan/publish-dev-articles-from-github-repo-p_gYCqpz/edit) runs for every `git push`, creating or updating articles using the [DEV API](https://docs.dev.to/api/).

I'll show you how easy this is to setup for your own posts, and you'll see what benefits you get managing posts locally.

## How this works

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

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1590356175/dev.to%20posts/dev-published-article_sjkyvn.png" alt="My first post, published" width="600px"/>

How cool is that!

## Why manage DEV posts in a Git repo?

- You can use your own text editor, with your own shortcuts and plugins.
- Every change you make to an article is tracked in a Git repo. You can see diffs between versions, and revert changes at any time.
- You can run [Git hooks](https://git-scm.com/book/fa/v2/Customizing-Git-Git-Hooks), for example: you can run a script to validate your Markdown or spell check it before your change gets commited your repo
- There are so many other automations you can run on `git push`. For example, once you publish your article to DEV, you could automatically post its link to Twitter.

## How to set this up

To get started, you'll need a [Github](https://github.com) account and a [DEV API key](https://dev.to/settings/account).

**I made a video that walks through this whole process, if you prefer that over text**

**VIDEO HERE**

[Create a new Github repo](https://github.com/new) to manage your DEV posts:

![DEV posts Github repo title](https://dev-to-uploads.s3.amazonaws.com/i/kgmyzh4vf6xmj1tbpuj1.png)

Clone the repo locally:

```bash
git clone git@github.com:[YOUR_USERNAME]/dev-to-posts.git
```

Next, you'll configure a [Pipedream](https://pipedream.com) workflow to publish your articles using the [DEV API](https://docs.dev.to/api/).

Pipedream is an integration platform for developers. For this flow, Pipedream works like [Github Actions](https://github.com/features/actions): each time you `git push`, the workflow runs. Pipedream workflows are written using [pre-built actions](https://docs.pipedream.com/workflows/steps/actions/#using-existing-actions) and [custom Node.js code](https://docs.pipedream.com/workflows/steps/code/), each of which can connect to hundreds of API integrations.

Visit [https://pipedream.com] and click the green **Get Started** button to sign up for a free account.

**Get Started Image**

Once you've signed up, [**open my DEV workflow**](https://pipedream.com/@dylan/publish-dev-articles-from-github-repo-p_gYCqpz/edit) and click **Copy** near the top-right. **This creates a copy of my workflow in your account, that will run for _your_ repo**.

First, you'll be asked to configure the **trigger** step. This workflow runs every time you `git push` to your repo. You'll just need to connect your Github account and select your repo from the dropdown menu:

![Connect Github account](https://res.cloudinary.com/dkbxegavp/image/upload/v1590435452/dev.to%20posts/connect-github-account_vbugvb.png)

![Choose DEV posts repo](https://res.cloudinary.com/dkbxegavp/image/upload/v1590435484/dev.to%20posts/choose-dev-to-repo_sog0ux.png)

Your trigger step should look like this when you're done:

![Finished Trigger step](https://res.cloudinary.com/dkbxegavp/image/upload/v1590435498/dev.to%20posts/finished-trigger-setup_lo0a6i.png)

Click **Create Source** at the bottom right of the trigger step. This will configure a [webhook](https://requestbin.com/blog/working-with-webhooks/) in your Github repo that sends data about every push to this Pipedream workflow.

The rest of the workflow parses the Git commits included in this push and fetches the content of any new or updated Markdown files. If you're adding a _new_ article to your repo, the workflow creates a new DEV article. If you're pushing an update to an existing article, the workflow updates that DEV article.

This logic is broken up into [workflow steps](https://docs.pipedream.com/workflows/steps/). You'll need to connect your Github and DEV accounts to these steps to make sure the workflow can connect to these APIs. **Just scroll down through the workflow, and press the Connect Account buttons everywhere you see them.** Like in the trigger step, this will prompt you to connect your Github account or enter your DEV API key.

## Making changes to articles in the DEV UI

**Any change you make to articles in the DEV UI will get overwritten unless you also make those changes to the file in `git`**.

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
