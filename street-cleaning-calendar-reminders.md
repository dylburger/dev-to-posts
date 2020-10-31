---
title: How Pipedream saved me hundreds of dollars in parking tickets
published: false
---

I grew up in Oklahoma City. In OKC, you drive everywhere. Public transportation is lacking and [it's a _huge_ city](https://www.google.com/search?q=okc+square+miles&oq=okc+square+miles&aqs=chrome.0.0i457j69i57.2618j0j9&sourceid=chrome&ie=UTF-8) — over 100 square miles bigger than Los Angeles.

Then I moved to San Francisco, and drove nowhere. My car sat on the street as I biked to work. But the Public Works department [cleans most streets on a schedule](https://www.sfpublicworks.org/services/mechanical-street-sweeping-and-street-cleaning-schedule), and if you don't move your car before cleaning begins, they give you a ticket.

The schedule varies from street to street — one block might be Mondays, another Wednesdays — and I would always forget to move my car at the right time. Since I rarely drove it anyway, I ended up selling it.

Fast forward to the present. My wife and I have a child:

<img alt="My child is a dog" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604088585/dev.to%20posts/IMG_1501_cr82u6.jpg" width="400px" />

And we bought a new car. The memories of those tickets rushed back. I needed something to remind me to move my car at the right time, no matter where I parked. I needed a way to turn this:

<img alt="Example street cleaning sign" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1603932358/dev.to%20posts/Camera_2020-06-07_at_11.41.53_mzsz9w.jpg" width="400px" />

into this:

![Calendar reminder for street cleaning](https://res.cloudinary.com/dkbxegavp/image/upload/v1590802144/dev.to%20posts/Screen_Shot_2020-05-29_at_6.28.27_PM_qs0cah.png)

I used [iOS Shortcuts](https://support.apple.com/guide/shortcuts/welcome/ios) and [Pipedream](https://pipedream.com) to automate this, with help from a handful of APIs. This use case is unique, but I hope what I learned about solving a real-world problem will be helpful for any automation you do.

## **What is Pipedream?**

[Pipedream](https://pipedream.com) is an integration platform for developers. You can use it to run **workflows** - a set of steps that compose an automation. You can run workflows on HTTP requests, emails, on a schedule, or in response to app-based events like new tweets, new files uploaded to Google Drive, and more.

Within a workflow, you can automate [300+ apps](https://docs.pipedream.com/apps/all-apps/) using pre-built actions that perform common operations, like creating a new calendar event, or sending an email. You can also write [any Node.js code](https://docs.pipedream.com/workflows/steps/code/) when you need to solve a custom use case where code works best.

<img alt="Pipedream" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604099472/dev.to%20posts/Screen_Shot_2020-10-30_at_4.10.19_PM_lewsqp.png" width="400px" />

You can think of Pipedream as a mix of integration tools like Zapier / IFTTT and serverless platforms like AWS Lambda / Google Cloud Functions. [Docs here](https://docs.pipedream.com/).

## **First attempts - extracting text from the signs**

I'll spare y'all the details of my many failed attempts. **In short, the real world produces messy data**.

Since the street signs include the cleaning schedule, I thought I could take a picture of the sign and use the text to create the reminders. I extracted that text using [Google Cloud's Vision API](https://cloud.google.com/vision/docs/ocr). Then, I parsed that text to get the day and time of the cleaning, creating a Google Calendar reminder. This worked great for a few signs around my neighborhood.

Then I found this sign:

<img alt="First bad sign" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1603932318/dev.to%20posts/Camera_2020-06-07_at_11.53.10_rafx9h.jpg?test=1" width="400px" />

and this one:

<img alt="Second bad sign" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1603931501/dev.to%20posts/Camera_2020-06-07_at_12.30.30_irqola.jpg?test=1" width="400px" />

Clearly, I couldn't rely on reading the text of every sign. I needed a different approach.

## **DataSF to the rescue**

The City of San Francisco operates an "open data" portal called [DataSF](https://datasf.org/opendata/). The [DataSF team](https://datasf.org/about/#who-we-are) helps source data from various city departments and aggregates it into a single platform.

<img alt="DataSF" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604097600/dev.to%20posts/Screen_Shot_2020-10-30_at_2.21.32_PM_ekzimj.png" width="600px" />

Anyone can download [COVID-19](https://data.sfgov.org/browse?category=COVID-19) stats, [311 calls](https://data.sfgov.org/City-Infrastructure/311-Cases/vw6y-z8j6), a [map of every tree maintained by the city](https://data.sfgov.org/City-Infrastructure/Street-Tree-List/tkzw-k3nq), and hundreds other public datasets. All the data are accessible via API.

I'd used DataSF for past projects, so I figured I'd search their portal for "street cleaning". And what do you know - they provide [the street cleaning schedule for all city streets](https://data.sfgov.org/City-Infrastructure/Street-Sweeping-Schedule/yhqp-riqs).

Every record in this data set had the following structure:

- A Centerline Network Number - the city's unique ID for the street segment (roughly a few city blocks)
- The side of the street this cleaning schedule applies to (the schedule for opposite sides of the streets differed)
- The day and time of cleaning
- A [Well-known text (WKT) representation](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry#Geometric_objects) of the line representing the street segment

The last field looked like this:

```
LINESTRING (
  -122.485667402435 37.778117247851,
  -122.485532329198 37.776252458259
)
```

You can use a WKT viewer like [Wicket](https://arthur-e.github.io/Wicket/sandbox-gmaps3.html) to visualize these segments on a map:

<img alt="Example street segment" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604092677/dev.to%20posts/Screen_Shot_2020-10-30_at_2.16.21_PM_knl6hu.png" width="400px" />

**I wanted to find the street segment _closest_ to where I was parked so I could get its cleaning schedule**. I hadn't worked with geo data much, so it wasn't obvious how I'd solve that problem.

DataSF is powered by a platform called [Socrata](https://www.tylertech.com/products/socrata). When you make API requests to DataSF, you're using [Socrata's API](https://dev.socrata.com/). They provide [a list of functions](https://dev.socrata.com/docs/functions/) that can be used in API requests. I scanned this list and found the [`intersects()` function](https://dev.socrata.com/docs/functions/intersects.html), which "allows you to compare two geospatial types to see if they intersect or overlap each other".

Instead of finding the closest street segments to my car, I could reframe the problem: **I want to find the street segment that overlaps with my current location**.

I could use my phone to get my current location. But my location is a _point_, and the street segment is a _line_ in the center of the street. Those geometries don't intersect.

<img alt="Point and line street drawing" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604096706/dev.to%20posts/62578758561__DB85B347-DDF0-4BFF-B8BC-DEDCE04DCA77_w4htrp.jpg" width="400px" />

Instead, we need to draw a box around our current location a few meters in each direction. In WKT terms, this box is a `POLYGON`, and **we can ask DataSF whether that polygon intersects with any streets**. This also helps address [the imperfect accuracy of GPS](https://www.gps.gov/systems/gps/performance/accuracy/#:~:text=For%20example%2C%20GPS%2Denabled%20smartphones,receivers%20and%2For%20augmentation%20systems.) by broadening the area where we search for close streets. (By the way — that article on GPS Accuracy is an incredible read and a testament to the power of GPS).

<img alt="Polygon and line drawing" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604096881/dev.to%20posts/IMG_1509_cqysl4.jpg" width="400px" />

This worked great, but presented a new problem. Every street segment has _two_ cleaning records: one for the left side of the street, another for the right. The WKT `LINESTRING` for both sides ran down the center of the street, so there's no way to tell whether you're on the right side or the left side by comparing the distance from your current location. And since GPS isn't perfectly accurate, we wouldn't want a program to pick — it might pick the wrong side.

There's a non-obvious but simple solution to this problem: **just let me choose the right time from a list**.

<img alt="iOS Shortcut schedule" src="https://res.cloudinary.com/dkbxegavp/image/upload/v1604102875/dev.to%20posts/IMG_1510_wnesa4.jpg" width="400px" />

You don't have to automate everything; it's OK for scripts to prompt for user input when human choice is required.

## **Glueing it all together with iOS Shortcuts**

Even in the early versions of this project, when I was taking pictures of street signs, I used [iOS Shortcuts](https://support.apple.com/guide/shortcuts/welcome/ios) to kick off the automation from my iPhone.

Shortcuts provides a "no code" programming environment for your iPhone. You can use it to retrieve your current location, take pictures, make HTTP requests, trigger actions in other iPhone apps, and more. They even allow for basic flow control (if / then statements, for loops, and more). And they provide a way to prompt a user to select an option from a list. **So I used the DataSF API to find the closest streets and their cleaning schedules, then let the user choose the right one**.

End-to-end, here's how the automation works:

- _Shortcuts_ : Get current location
- _Shortcuts_ : Send that location to Pipedream (HTTP Request)
- _Pipedream_ : [Get street cleaning schedules for a given location](https://pipedream.com/@dylan/street-cleaning-1-get-street-cleaning-schedules-for-a-lat-long-p_7NCLjW/edit)
- _Shortcuts_ : Present schedules in list, let user choose
- _Shortcuts_ : Send chosen schedule and location to Pipedream (HTTP Request)
- _Pipedream_ : [Delete old reminders, create Google Calendar reminder with current location](https://pipedream.com/@dylan/street-cleaning-2-create-street-cleaning-calendar-reminder-p_o7Cxqr/edit)

So far, no tickets!

## **Creating the calendar reminder**

This [last workflow](<(https://pipedream.com/@dylan/street-cleaning-2-create-street-cleaning-calendar-reminder-p_o7Cxqr/edit)>) is neat, and I want to show you two things you might be able to use in other projects.

SFData gave me the day and time of cleanings, but busy streets are cleaned multiple days: Tuesday _and_ Thursday, for example. I had to find the closest calendar date in the future given that schedule. If I parked on that Tue / Thur street on a Wednesday, I'd need to create a reminder to move my car by the next day (Thursday). If I parked there on Friday, the reminder would need to be for _next_ Tuesday.

Enter [Chrono](https://github.com/wanasit/chrono), "a natural language date parser in Javascript". Chrono parses "Today", "This tuesday", and other human-readable dates into a JavaScript Date object. They provide a function that did exactly what I needed:

```javascript
// Give me the Date object of the first 12PM Wed in the future
// https://github.com/wanasit/chrono#parsing-options
chrono.parseDate("12PM Wed", new Date(), { forwardDate: true });
// Wed Nov 4 2020 12:00:00 GMT+0000 (Coordinated Universal Time)
```

Once I had JavaScript Dates for streets with multiple cleanings, I compared them and found the closest time. Now we could create a calender reminder.

I found another problem quickly. I drive my car for errands, and might move it days before street cleaning is scheduled. But that reminder is still on my calendar, and it'd tell me to move my car for the street I parked on days ago. I don't want to manually delete old reminders each time. I needed a way to automatically delete them when I moved my car.

I ended up tagging new calendar events with metadata to identify them as "move car reminders". This way, the Pipedream workflow could find and delete all existing move car reminders before creating a new one. Google Calendar allows you to add this metadata as [extended properties](https://developers.google.com/calendar/extended-properties):

> The fields of the Events resources cover the most common data associated with an event, such as location, start time, etc, but applications may want to store additional metadata specific to their use case. The Calendar API provides the ability to set hidden key-value pairs with an event, called extended properties. Extended properties make it easy to store application-specific data for an event without having to utilize an external database.

In code, you can just attach this metadata in the create event API request:

```
{
  extendedProperties: {
    private: {
      streetCleaning: true
    }
  }
}
```

Finally, I add my wife to the invite, add reminders 24 and 12 hours ahead of the cleaning time, and add the (lat, long) of the car to the invite so we remember where it's parked.

## **Wrapping up**
