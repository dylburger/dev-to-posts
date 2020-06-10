---
title: Avoiding street cleaning tickets with iOS Shortcuts, Pipedream, and Google's Cloud Vision API
published: false
---

I live in San Francisco, and I park my car on the street. The Public Works department [cleans most streets on a schedule](https://www.sfpublicworks.org/services/mechanical-street-sweeping-and-street-cleaning-schedule), normally once or twice a week. If you don't move your car, you get a ticket. The schedule varies street by street, but they're kind enough to post this schedule clearly on each block:

![Example street cleaning sign](https://res.cloudinary.com/dkbxegavp/image/upload/v1590801811/dev.to%20posts/IMG_1033_d3nx9w.jpg)

But I daydream a lot, so I tend to forget when I'm supposed to move my car - I've gotten more than a few tickets in my day.

I needed a way to turn this:

![Example street cleaning sign](https://res.cloudinary.com/dkbxegavp/image/upload/v1590801811/dev.to%20posts/IMG_1033_d3nx9w.jpg)

into this:

![Calendar reminder for street cleaning](https://res.cloudinary.com/dkbxegavp/image/upload/v1590802144/dev.to%20posts/Screen_Shot_2020-05-29_at_6.28.27_PM_qs0cah.png)

So I built it! Let's see how this works.

## The Pipedream workflow

[Pipedream](https://pipedream.com) is an integration platform for developers. You can use it to run **workflows** - just a set of steps that compose an automation. You can run workflows on HTTP requests, email, on a schedule, or in response to app-based events: new tweets, new file upload to Google Drive, and more.

Within a workflow, you can connect to [200+ apps](https://docs.pipedream.com/apps/all-apps/), using pre-built actions that perform common operations, like creating a new calendar event, or sending an email. You can also write [any Node.js code](https://docs.pipedream.com/workflows/steps/code/) - this is where Pipedream shines.

I wrote [this Pipedream workflow](https://pipedream.com/@dylan/move-car-image-processing-calendar-reminder-p_vQCNLM/edit) to take an image of a street cleaning sign and create an event on my calendar to remind me to move my car before street cleaning begins. The code for this workflow is public, and you can copy it into your own Pipedream account by clicking the **Copy** button near the top right of the page.

First, it accepts a photo of the street cleaning sign from my phone, along with the latitude and longitude where I took the photo — this way, I can also remember where I parked. This is sent to Pipedream using an [iOS Shortcut](https://support.apple.com/en-us/HT208309) - I'll show you how this works below. The shortcut sends the image, `lat`, and `long` as `multipart/form-data`, and parses it into a [JavaScript object](https://docs.pipedream.com/workflows/events/#event-format) that we can work with in the rest of our workflow by referencing the variable `event.body`:

![event.body example payload in Pipedream](https://res.cloudinary.com/dkbxegavp/image/upload/v1590803935/dev.to%20posts/Screen_Shot_2020-05-29_at_6.40.17_PM_dmea1o.png)

Pipedream uploads the image to an Amazon S3 bucket and provides the link as a [signed URL](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html) that you can download or reference in your workflow.

### Extracting text from the image

Every Pipedream workflow is composed of [steps](https://docs.pipedream.com/workflows/steps/). The first step sends the photo of the street cleaning sign to Google's Cloud Vision API and returns the text Google identifies in the image.

```javascript
// Detect text in image using the Google Vision API
// Free for up to 1,000 feature units / month
// https://cloud.google.com/vision/pricing

const vision = require("@google-cloud/vision");

const key = JSON.parse(auths.google_cloud.key_json);

const visionClient = new vision.ImageAnnotatorClient({
  projectId: key.project_id,
  credentials: {
    client_email: key.client_email,
    private_key: key.private_key,
  },
});

// Occasionally, Google's vision API fails to process the image
// In practice, I noticed that the next run succeeded. Try
// processing the image up to 3 times if we encounter these errors.
let result;
let i = 0;
do {
  i += 1;
  console.log("FETCHING IMAGE");
  textDetectionRes = await visionClient.textDetection(
    steps.trigger.event.body.image.url
  );
  result = textDetectionRes[0];
} while (
  i < 3 &&
  result.error &&
  (result.error.code === 4 || result.error.code === 14)
);

if (result.error) {
  this.err = result.error;
  $end("Error fetching image");
}

this.result = result;

// If we received no error, but still got no text
if (!this.result.error && !this.result.fullTextAnnotation) {
  $end("No text found in image");
}

// The first element of the textAnnotations array appears
// to contain all of the text found in the image.
this.textInImage = this.result.fullTextAnnotation.text;
```

Pipedream provides a few features of note here:

- Each step is implicitly wrapped in an `async` function that accepts the data that triggered the workflow — the `event` variable noted above — and any data from previous steps.
- I can use Google's Cloud Vision npm package simply by `require`ing it: `const vision = require('@google-cloud/vision');`. Pipedream downloads the package and makes it available in the code without you having to `npm install` it yourself.
- [I can link any connected accounts to steps](https://docs.pipedream.com/workflows/steps/code/auth/#the-auths-object), giving that step access to API keys or OAuth grants tied to apps I'd like to use in my workflow. Here, I've linked a Google Cloud [service account](https://cloud.google.com/iam/docs/service-accounts), which gives the step permission to access the Cloud Vision API on my behalf. The variable `auths.google_cloud.key_json` exposes this service account key to the step, which I use to authenticate.
- I can [export data for use in other steps](https://docs.pipedream.com/workflows/steps/#step-exports). Here, I'd like to return the text that the Vision API found in the image so I can parse that in the next step. In workflows, `this` refers to the current step, so I can set `this.textInImage` to the value of the text returned by the Vision API.

To use this step, you'll need to:

- [Enable the Cloud Vision API](https://cloud.google.com/vision/docs/setup) in your Google Cloud account
- Create a Google Cloud [service account](https://cloud.google.com/iam/docs/service-accounts) with **no linke role** (using the Cloud Vision API requires no specific permissions). Download the JSON key associated with the service account, click **Connect Account** above the step, and paste in the JSON for your service account.
