---
title: Avoiding tickets with Pipedream
published: false
---

I grew up in Oklahoma City. In OKC, you drive everywhere. Public transporation is lacking and [it's a _huge_ city](https://www.google.com/search?q=okc+square+miles&oq=okc+square+miles&aqs=chrome.0.0i457j69i57.2618j0j9&sourceid=chrome&ie=UTF-8) - over 100 square miles bigger than Los Angeles.

When I moved to San Francisco ten years ago, I drove nowhere. My car sat on the street as I biked to work. But the Public Works department [cleans most streets on a schedule](https://www.sfpublicworks.org/services/mechanical-street-sweeping-and-street-cleaning-schedule), and if you don't move your car before cleaning begins, they give you a ticket. The schedule varies from street to street - one block might be Mondays, another Wednesdays - and I would always forget to move my car at the right time. Since I rarely drove it anyway, I ended up selling it.

Fast forward to the present. My wife and I have a child:

<img alt="My child is a dog" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1603928520/dev.to%20posts/IMG_4173_pqp6c1.jpg" width="400px" />

We bought a new car to take him on hikes. The memories of those street cleaning tickets rushed back. I wasn't going to let the Public Works department win. I wanted a process that reminded me to move my car at the right time, no matter where I parked.

I needed a way to turn this:

<img alt="Example street cleaning sign" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1592876647/dev.to%20posts/Camera_2020-06-07_at_11.41.53_mzsz9w.jpg" width="400px" />

into this:

![Calendar reminder for street cleaning](https://res.cloudinary.com/dkbxegavp/image/upload/v1590802144/dev.to%20posts/Screen_Shot_2020-05-29_at_6.28.27_PM_qs0cah.png)

I used [Pipedream](https://pipedream.com) to automate this, with help from a handful of APIs. The finished product wasn't at all what I envisioned at the start, and I learned a few important lessons along the way. I thought it'd be fun to talk about that journey.

## What I tried first

I'll spare y'all the details of my many failed attempts. **In short, the real world is messy**.

Data scientists know this all too well. There is no such thing as "clean" data, even when software records it. Observations may not include all fields, some values might get truncated, and the program that logs the data will inevitably encounter a bug that affects data collection.

Here, my data were street cleaning signs - specifically, their text. I was able to extract that text using [Google Cloud's Vision API](https://cloud.google.com/vision/docs/ocr), and was able to reliably parse that text to get the day and time of the street cleaning on sample data.

Then I found this sign:

<img alt="First bad sign" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1603931480/dev.to%20posts/Camera_2020-06-07_at_11.53.10_rafx9h.jpg" width="400px" />

and this one:

<img alt="Second format of street cleaning signs" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1603931501/dev.to%20posts/Camera_2020-06-07_at_12.30.30_irqola.jpg" width="400px" />

Clearly, I couldn't rely on parsing the text of the sign. I needed another way to get the cleaning schedules.

## San Francisco Open Data to the rescue

## What is Pipedream?

[Pipedream](https://pipedream.com) is an integration platform for developers. You can use it to run **workflows** - just a set of steps that compose an automation. You can run workflows on HTTP requests, emails, on a schedule, or in response to app-based events like new tweets, new files uploaded to Google Drive, and more.

Within a workflow, you can connect to [300+ apps](https://docs.pipedream.com/apps/all-apps/), using pre-built actions that perform common operations, like creating a new calendar event, or sending an email. You can also write [any Node.js code](https://docs.pipedream.com/workflows/steps/code/) - this is where Pipedream shines.
