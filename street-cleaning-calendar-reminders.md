---
title: How Pipedream saved me hundreds of dollars in parking tickets
published: false
---

I grew up in Oklahoma City. In OKC, you drive everywhere. Public transportation is lacking and [it's a _huge_ city](https://www.google.com/search?q=okc+square+miles&oq=okc+square+miles&aqs=chrome.0.0i457j69i57.2618j0j9&sourceid=chrome&ie=UTF-8) - over 100 square miles bigger than Los Angeles.

Then I moved to San Francisco, and drove nowhere. My car sat on the street as I biked to work. But the Public Works department [cleans most streets on a schedule](https://www.sfpublicworks.org/services/mechanical-street-sweeping-and-street-cleaning-schedule), and if you don't move your car before cleaning begins, they give you a ticket. The schedule varies from street to street - one block might be Mondays, another Wednesdays - and I would always forget to move my car at the right time. Since I rarely drove it anyway, I ended up selling it.

Fast forward to the present. My wife and I have a child:

<img alt="My child is a dog" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604088585/dev.to%20posts/IMG_1501_cr82u6.jpg" width="400px" />

And we bought a new car to take him on hikes. The memories of those tickets rushed back. I wasn't going to let the Public Works department win. I needed something to remind me to move my car at the right time, no matter where I parked. I needed a way to turn this:

<img alt="Example street cleaning sign" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1603932358/dev.to%20posts/Camera_2020-06-07_at_11.41.53_mzsz9w.jpg" width="400px" />

into this:

![Calendar reminder for street cleaning](https://res.cloudinary.com/dkbxegavp/image/upload/v1590802144/dev.to%20posts/Screen_Shot_2020-05-29_at_6.28.27_PM_qs0cah.png)

I used [Pipedream](https://pipedream.com) to automate this, with help from a handful of APIs. The finished product wasn't at all what I envisioned, and I learned a few important lessons along the way.

## **What is Pipedream?**

[Pipedream](https://pipedream.com) is an integration platform for developers. You can use it to run **workflows** - just a set of steps that compose an automation. You can run workflows on HTTP requests, emails, on a schedule, or in response to app-based events like new tweets, new files uploaded to Google Drive, and more.

Within a workflow, you can connect to [300+ apps](https://docs.pipedream.com/apps/all-apps/) using pre-built actions that perform common operations, like creating a new calendar event, or sending an email. You can also write [any Node.js code](https://docs.pipedream.com/workflows/steps/code/).

<img alt="Pipedream" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604099472/dev.to%20posts/Screen_Shot_2020-10-30_at_4.10.19_PM_lewsqp.png" width="400px" />

In general, you can think of Pipedream as a mix of integration tools like Zapier / IFTTT and serverless platforms like AWS Lambda / Google Cloud Functions.

## **First attempts - extracting text from the signs**

I'll spare y'all the details of my many failed attempts. **In short, the real world produces messy data**.

Since the street signs include the cleaning schedule, I thought I could take a picture of the sign and use the text to create the reminders. I extracted that text using [Google Cloud's Vision API](https://cloud.google.com/vision/docs/ocr). Then, I was able to parse that text to get the day and time of the cleaning, creating a Google Calendar reminder. This worked great for a few signs around my neighborhood.

Then I found this sign:

<img alt="First bad sign" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1603932318/dev.to%20posts/Camera_2020-06-07_at_11.53.10_rafx9h.jpg?test=1" width="400px" />

and this one:

<img alt="Second bad sign" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1603931501/dev.to%20posts/Camera_2020-06-07_at_12.30.30_irqola.jpg?test=1" width="400px" />

Clearly, I couldn't rely on reading the text of every street cleaning sign. I needed a different approach.

## **DataSF to the rescue**

The City of San Francisco operates an "open data" portal, [DataSF](https://datasf.org/opendata/). The [DataSF team](https://datasf.org/about/#who-we-are) helps source data from various city departments and aggregates it into a single platform.

<img alt="DataSF" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604097600/dev.to%20posts/Screen_Shot_2020-10-30_at_2.21.32_PM_ekzimj.png" width="400px" />

Thanks to their years of effort collecting city data, you can download [COVID-19](https://data.sfgov.org/browse?category=COVID-19) stats, [311 calls](https://data.sfgov.org/City-Infrastructure/311-Cases/vw6y-z8j6), a [map of every tree maintained by the Public Works Department](https://data.sfgov.org/City-Infrastructure/Street-Tree-List/tkzw-k3nq), and hundreds more. All the data are accessible via API.

I'd used DataSF for past projects, so I figured I'd search their portal for "street cleaning". And what do you know - they provide [the street cleaning schedule for all city streets](https://data.sfgov.org/City-Infrastructure/Street-Sweeping-Schedule/yhqp-riqs).

Every record in this data set had the following structure:

- A Centerline Network Number - the city's unique ID for the street segment (roughly a few city blocks)
- The side of the street this cleaning schedule applies to (the schedule for opposite sides of the streets differed)
- The day and time of cleaning
- A [Well-known text (WKT) representation](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry#Geometric_objects) of the line representing the street segment

The last field looked like this:

**LINESTRING (-122.485667402435 37.778117247851, -122.485532329198 37.776252458259)**

You can use a WKT viewer like [Wicket](https://arthur-e.github.io/Wicket/sandbox-gmaps3.html) to visualize these segments on a map:

<img alt="Example street segment" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604092677/dev.to%20posts/Screen_Shot_2020-10-30_at_2.16.21_PM_knl6hu.png" width="400px" />

**I wanted to find the street segment _closest_ to where I was parked so I could get its cleaning schedule**. I hadn't worked with geo data much, and it wasn't immediately obvious how I'd solve that problem efficiently.

DataSF is powered by a platform called [Socrata](https://www.tylertech.com/products/socrata). When you make API requests to DataSF, you're using [Socrata's API](https://dev.socrata.com/). They provide [a list of functions](https://dev.socrata.com/docs/functions/) that can be used in API requests. I scanned this list and found the [`intersects()` function](https://dev.socrata.com/docs/functions/intersects.html), which "allows you to compare two geospatial types to see if they intersect or overlap each other".

Instead of finding the closest street segments to my car, I could reframe the problem to **finding the street segment that _intersects_ with my current location**.

I could use my phone to get my current location. But my location is a _point_, and the street segment is a _line_ in the center of the street. Those geometries don't intersect.

<img alt="Point and line street drawing" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604096706/dev.to%20posts/62578758561__DB85B347-DDF0-4BFF-B8BC-DEDCE04DCA77_w4htrp.jpg" width="400px" />

Instead, we need to draw a box around our current location a few meters in each direction. In WKT terms, this box is a `POLYGON`, and **we can then ask DataSF whether that polygon intersects with any streets**. This also helps address [the imperfect accuracy of GPS](https://www.gps.gov/systems/gps/performance/accuracy/#:~:text=For%20example%2C%20GPS%2Denabled%20smartphones,receivers%20and%2For%20augmentation%20systems.) by broadening the area where we search for close streets.

<img alt="Polygon and line drawing" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604096881/dev.to%20posts/IMG_1509_cqysl4.jpg" width="400px" />
