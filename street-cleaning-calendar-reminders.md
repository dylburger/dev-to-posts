---
title: Avoiding street cleaning tickets with iOS Shortcuts, Pipedream, and Google's Cloud Vision API
---

I live in San Francisco, and I park my car on the street. The Public Works department cleans each street on a schedule, normally once or twice a week. That schedule varies street by street, but they're kind enough to post this schedule clearly on each block:

![Example street cleaning sign](https://res.cloudinary.com/dkbxegavp/image/upload/v1590801811/dev.to%20posts/IMG_1033_d3nx9w.jpg)

If you don't move your car before street cleaning starts, you get a ticket. I'm forgetful, so I tend to get a few tickets.

I needed a way to turn this:

![Example street cleaning sign](https://res.cloudinary.com/dkbxegavp/image/upload/v1590801811/dev.to%20posts/IMG_1033_d3nx9w.jpg)

into this:

![Calendar reminder for street cleaning](https://res.cloudinary.com/dkbxegavp/image/upload/v1590802144/dev.to%20posts/Screen_Shot_2020-05-29_at_6.28.27_PM_qs0cah.png)

So I built it! Let's see how this works.

## The Pipedream workflow

[Pipedream](https://pipedream.com) is an integration platform for developers. You can use it to run **workflows** - a series of steps that run a specific automation. Within a workflow, you can connect to [200+ apps](https://docs.pipedream.com/apps/all-apps/), using pre-built actions that perform common operations for these apps, like creating a new calendar event, or sending an email. You can also write [any Node.js code](https://docs.pipedream.com/workflows/steps/code/) - this is where Pipedream shines.

I wrote [this Pipedream workflow](https://pipedream.com/@dylan/move-car-image-processing-calendar-reminder-p_vQCNLM/edit) to accept a photo of the street cleaning sign on the block where I parked. It processes that image and creates an event on my calendar to remind me to move my car before street cleaning begins. The code for this workflow is public, so you can see how it works:

First, it accepts a photo of the street cleaning sign from my phone, along with the latitude and longitude where I took the photo. This is sent to Pipedream by an [iOS Shortcut](https://support.apple.com/en-us/HT208309) - we'll see how this works below. The shortcut sends the image, `lat`, and `long` as `multipart/form-data`, and parses it into a [JavaScript object](https://docs.pipedream.com/workflows/events/#event-format) — `event.body` — that we can work with in the rest of our workflow:
