---
title: Publish DEV articles from a Git repo, with Github + Pipedream
---

I wrote this article in VS Code, on my Mac, and published it to DEV by running `git push`. [This Pipedream workflow](https://pipedream.com/@dylan/publish-dev-articles-from-github-repo-p_gYCqpz/edit) runs every time I `git push` or merge a pull request to `master`, creating or updating articles using the [DEV API](https://docs.dev.to/api/).

Below, I'll talk about why I set this up, and show you how easy it is to configure for your own posts.

## A sneak peek at how this works

I'll show you the finished product first so you see how this works.

I start with this Markdown in a new file:

```markdown
Hello, world!
```

and push it to Github:

```bash
git add my-first-post.md
git commit -m "Adding first post"
git push
```

As soon as I push, a draft of that post will appear in my DEV account:

![My first draft article](https://res.cloudinary.com/dkbxegavp/image/upload/v1590355743/dev.to%20posts/dev-to-draft_bmqlgb.png)

I can edit and `git push` again, and the draft will update. When I'm ready to publish, I add this to the top of my Markdown:

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

and it's published:

**SIMPLIFY THIS IMAGE TO REFLECT SIMPLER POST**

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1590356175/dev.to%20posts/dev-published-article_sjkyvn.png" alt="My first post, published" width="600px"/>

How cool is that!

## Why manage DEV posts in a Git repo?

I like writing code in [VS Code](https://code.visualstudio.com/), with all its keyboard shortcuts, plugins, and other goodies I've added to make it my own. So when I write Markdown in the DEV editor, I miss my local setup. That's the primary reason I set this up: **I get to write articles in my own editor, with my own shortcuts and tools**.

But storing your articles in a Github repo carries other benefits:

- Every change you make to an article is tracked in Git. You can compare the changes you made between versions, or revert to an older version if you need. If you make your repo public, anyone can open a pull request to fix typos, broken links, and more.
- You can run [Git hooks](https://git-scm.com/book/fa/v2/Customizing-Git-Git-Hooks) or [Github Actions](https://help.github.com/en/actions) to automate basic tasks: for example, you could run a script to validate your Markdown or spell check it before your change gets commited your repo.
- You can trigger other, more complex automations on every `git push`. For example, once you publish your article to DEV, you could automatically post its link to Twitter.

## How to set this up

To get started, you'll need a [Github](https://github.com) account and a [DEV API key](https://dev.to/settings/account).

**I made a video that walks through this whole process, if you prefer that over text**

**VIDEO HERE**

First, [create a new Github repo](https://github.com/new) to manage your DEV posts:

![DEV posts Github repo title](https://dev-to-uploads.s3.amazonaws.com/i/kgmyzh4vf6xmj1tbpuj1.png)

Clone the repo locally:

```bash
git clone git@github.com:[YOUR_USERNAME]/dev-to-posts.git
```

Next, you'll configure a [Pipedream](https://pipedream.com) workflow to publish your articles using the [DEV API](https://docs.dev.to/api/).

Pipedream is an integration platform for developers. For this flow, Pipedream works like [Github Actions](https://github.com/features/actions): each time you push new Markdown files to your repo, the workflow runs. Pipedream workflows are written using [pre-built actions](https://docs.pipedream.com/workflows/steps/actions/#using-existing-actions) and [custom Node.js code](https://docs.pipedream.com/workflows/steps/code/), each of which can connect to hundreds of API integrations. You can run this workflow **for free** on Pipedream's [free tier](https://docs.pipedream.com/pricing/).

Visit [https://pipedream.com] and click the green **Get Started** button to sign up for a free account.

**Get Started Image**

Once you've signed up, [**open my DEV workflow**](https://pipedream.com/@dylan/publish-dev-articles-from-github-repo-p_gYCqpz/edit) and click **Copy** near the top-right. **This creates a copy of my workflow in your account, that will run for _your_ repo**.

First, you'll be asked to configure the **Trigger** step. This workflow runs every time Markdown files are added or modified in your repo. You'll just need to connect your Github account and select your repo from the dropdown menu:

![Connect Github account](https://res.cloudinary.com/dkbxegavp/image/upload/v1590435452/dev.to%20posts/connect-github-account_vbugvb.png)

![Choose DEV posts repo](https://res.cloudinary.com/dkbxegavp/image/upload/v1590435484/dev.to%20posts/choose-dev-to-repo_sog0ux.png)

Your trigger step should look like this when you're done:

![Finished Trigger step](https://res.cloudinary.com/dkbxegavp/image/upload/v1590435498/dev.to%20posts/finished-trigger-setup_lo0a6i.png)

Click **Create Source** at the bottom right of the trigger step. This will configure a [webhook](https://requestbin.com/blog/working-with-webhooks/) in your Github repo that notifies this workflow of any changes in your Git repo.

The next [step](https://docs.pipedream.com/workflows/steps/) of your workflow - `create_and_update_dev_posts` - runs the code to push this Markdown to the DEV API. If you add a _new_ article to your repo, the workflow creates a new DEV article. If you're pushing an update to an existing article, the workflow updates that DEV article.

To get this step working, you'll just need to connect your DEV API key. **Press the Connect Account button near the top of this step.** Like in the trigger step, this will prompt you to enter your DEV API key.

**Now you're ready to push your first article**. Create a new Markdown file in the Git repo you cloned above, adding the following contents:

```markdown
---
title: My First DEV Post
---

Hello, world!
```

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
