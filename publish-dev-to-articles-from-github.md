---
title: Publish DEV articles from a Git repo, with Github + Pipedream
cover_image: https://res.cloudinary.com/dkbxegavp/image/upload/v1591820988/dev.to%20posts/Screen_Shot_2020-06-10_at_1.29.13_PM_gz9lv5.png
tags: pipedream, github, meta, git
published: true
---

I wrote this article with [VS Code](https://code.visualstudio.com/), on my Mac, and published it by running `git push`. All my DEV posts are tracked by Git, and I can manage them from my local machine.

Below, I'll tell you why I set this up, and show you how easy it is to configure for your own posts.

## **How this works**

I'll show you the finished product first so you see how this works end-to-end.

First, I create a new Markdown file:

```markdown
---
title: My First DEV Post
---

Hello, world!
```

and push it to Github:

```bash
git add my-first-post.md
git commit -m "Adding first post"
git push
```

As soon as I push, [this Pipedream workflow](https://pipedream.com/@dylan/publish-dev-articles-from-github-repo-p_gYCqpz/edit) creates a draft of that post in my DEV account:

![My First Article Draft](https://res.cloudinary.com/dkbxegavp/image/upload/v1591819376/dev.to%20posts/Screen_Shot_2020-06-10_at_1.01.56_PM_ovbijo.png)

I can edit and `git push` again, and the draft will update. When I'm ready to publish, I add `published: true` to the top of my YAML front matter:

```markdown
---
published: true
title: My First DEV Post
---

Hello, world!
```

Then run:

```bash
git add my-first-post.md
git commit -m "Publishing first post"
git push
```

and it's published:

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1591819622/dev.to%20posts/Screen_Shot_2020-06-10_at_1.04.19_PM_qprplu.png" alt="My first post, published" width="600px"/>

How cool is that!

## **Why manage DEV posts in a Git repo?**

I like writing code in [VS Code](https://code.visualstudio.com/), with all its keyboard shortcuts, plugins, and other goodies I've added to make it my own. When I write Markdown in the DEV editor, I miss my local setup. That's the primary reason I set this up: **I get to write articles in my own editor, with my own shortcuts and tools**.

But storing your articles in a Github repo carries other benefits:

- Every change you make to an article is tracked by Git. You can compare the changes you made between versions, or revert to an older version. If you make your repo public, anyone can open a pull request to fix typos, broken links, and more.
- You can run [Git hooks](https://git-scm.com/book/fa/v2/Customizing-Git-Git-Hooks) or [Github Actions](https://help.github.com/en/actions) to automate basic tasks: for example, you could run a script to validate your Markdown or spell check it before your change gets commited your repo.
- You can trigger other, more complex automations on every `git push` using [Pipedream](https://pipedream.com) workflows. For example, once you publish your article to DEV, you could automatically post its link to Twitter.

## **How to set this up**

To get started, you'll need a [Github](https://github.com) account and a [DEV API key](https://dev.to/settings/account).

First, [create a new Github repo](https://github.com/new) to manage your DEV posts:

![DEV posts Github repo title](https://dev-to-uploads.s3.amazonaws.com/i/kgmyzh4vf6xmj1tbpuj1.png)

Then clone the repo locally:

```bash
git clone git@github.com:[YOUR_USERNAME]/dev-to-posts.git
```

Next, you'll configure a [Pipedream](https://pipedream.com) workflow to publish your articles using the [DEV API](https://docs.dev.to/api/).

**Pipedream is an integration platform for developers**. For this flow, Pipedream works like [Github Actions](https://github.com/features/actions): each time you push new Markdown files to your repo, the workflow runs. Pipedream workflows are written using [pre-built actions](https://docs.pipedream.com/workflows/steps/actions/#using-existing-actions) and [custom Node.js code](https://docs.pipedream.com/workflows/steps/code/), each of which can connect to hundreds of API integrations. You can run this workflow **for free** on Pipedream's [free tier](https://docs.pipedream.com/pricing/).

Visit [https://pipedream.com](https://pipedream.com) and press the **Sign In** button in the top-right to sign up for a Pipedream account:

![Sign up for Pipedream account](https://res.cloudinary.com/dkbxegavp/image/upload/v1591822072/dev.to%20posts/Screen_Shot_2020-06-10_at_1.38.36_PM_zrnmrj.png)

Once you've signed up, [**open this DEV workflow**](https://pipedream.com/@dylan/publish-dev-articles-from-github-repo-p_gYCqpz/edit) and click **Copy** near the top-right. **This creates a copy of my workflow in your account, that will run for _your_ DEV repo**.

First, you'll be asked to configure the **Trigger** step. This workflow runs every time Markdown files are added or modified in your repo. You'll just need to connect your Github account and select your repo from the dropdown menu:

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1590435452/dev.to%20posts/connect-github-account_vbugvb.png" alt="Connect Github account" width="200px"/>

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1590435484/dev.to%20posts/choose-dev-to-repo_sog0ux.png" alt="Choose DEV posts repo" width="300px"/>

Then click **Create Source** at the bottom right of the trigger step. This will configure a [webhook](https://requestbin.com/blog/working-with-webhooks/) in your Github repo that notifies this workflow anytime a push happens.

You'll also need to turn this trigger step **On** to make sure it runs automatically on new pushes:

![Turn trigger step on](https://res.cloudinary.com/dkbxegavp/image/upload/v1591823665/dev.to%20posts/Screen_Shot_2020-06-10_at_2.13.12_PM_q5e4jm.png)

The next [step](https://docs.pipedream.com/workflows/steps/) of the workflow - `create_and_update_dev_posts` - runs Node.js code to push this Markdown to the DEV API. If you add a _new_ article to your repo, the workflow creates a new DEV article. If you're pushing an update to an existing article, the workflow updates that DEV article.

To get this step working, you'll just need to connect your DEV API key. **Press the Connect Account button near the top of this step.** Like in the trigger step, this will prompt you to enter your DEV API key:

![Connect DEV API key](https://res.cloudinary.com/dkbxegavp/image/upload/v1591814490/dev.to%20posts/Screen_Shot_2020-06-10_at_11.36.01_AM_zp6hko.png).

**Now you're ready to push your first article**. Create a new Markdown file in the Git repo you cloned above, adding the following contents:

```markdown
---
title: My First DEV Post
---

Hello, world!
```

Add, commit, and push this file to Github:

```bash
git add my-first-post.md
git commit -m "Adding first post"
git push
```

As soon as you push these changes, you should see a new event appear in your Pipedream workflow:

![New Pipedream event](https://res.cloudinary.com/dkbxegavp/image/upload/v1591819326/dev.to%20posts/Screen_Shot_2020-06-10_at_12.57.13_PM_qu31r1.png)

This triggers the workflow, creating a new draft article in DEV:

![New DEV draft](https://res.cloudinary.com/dkbxegavp/image/upload/v1591819376/dev.to%20posts/Screen_Shot_2020-06-10_at_1.01.56_PM_ovbijo.png)

To publish the article, add `published: true` to the [YAML front matter](https://dev.to/p/editor_guide) section at the top of your file:

```markdown
---
title: My First DEV Post
published: true
---
```

Then run:

```bash
git add my-first-post.md
git commit -m "Publishing first post"
git push
```

You should see your brand new article show up, published, in DEV:

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1591819622/dev.to%20posts/Screen_Shot_2020-06-10_at_1.04.19_PM_qprplu.png" alt="My first post, published, again" width="600px"/>

To unpublish, set the `published` flag to `false`:

```markdown
---
title: My First DEV Post
published: false
---
```

**Since you own this copy of the Pipedream workflow, you can modify the code in any way you'd like**. You could update the DEV step to change how articles get published, or add a step to send a message to Slack, or post a tweet, any time you publish a new article. If you make any edits, share them in the comments below or publish your own article about it!

The rest of this post addresses other details of the integration, like managing images in articles, and other [YAML front matter](https://dev.to/p/editor_guide) you can use to change details of your posts.

## **Making changes to articles in the DEV UI**

**Any change you make to articles in the DEV UI will get overwritten unless you also make those changes to the file in your repo**.

## **How to include images in posts**

Currently, DEV doesn't have an API for uploading images, so I'm using [Cloudinary](https://cloudinary.com/) to host mine, referencing the Cloudinary URL in my Markdown:

```markdown
![My image](https://res.cloudinary.com/dkbxegavp/image/upload/v1590355743/dev.to%20posts/dev-to-draft_bmqlgb.png)
```

In theory, this workflow could be changed to reference local images in your article Markdown:

```markdown
![My image](./images/my-image.png)
```

Once you commit the images to your repo, the Pipedream workflow could upload the images to Cloudinary directly, and change the article references to point to the hosted version, instead.

Remember — the Pipedream workflow you copied above is yours to modify. **You can add any logic you'd like to that workflow, uploading images to Cloudinary or another hosting provider, or include anything else custom to your publishing process**.

## **Default branch only**

The workflow processes commits on the default repo branch only (`master`, unless you've changed it). Commits to other branches are ignored, until they're merged to your default branch.

## **One Markdown file : One post**

Each Markdown file you push to your DEV repo generates its own DEV post. Your files must have a `.md` extension for them to be processed. Any non-Markdown files are ignored by the workflow.

## **Front Matter**

The Pipedream workflow uses the same YAML front matter [that DEV supports](https://dev.to/p/editor_guide) to update the published state, title, tags, and more.

None of the front matter variables are required. If you include no front matter, your article will be saved to DEV as a draft, with a title based on the filename (see below).

### **Titles**

The `title` front matter variable is always used if present.

If `title` is absent, the workflow will use the filename of the article, converting hyphens and underscores as spaces. Case is preserved:

```text
my-first-post.md -> my first post
My_First_Post.md -> My First Post
My First Post.md -> My First Post
```

If you rely on this convention and then later want to set the `title` front matter variable, the workflow will update the title according to the variable's value, and use that instead of the filename moving forward.
