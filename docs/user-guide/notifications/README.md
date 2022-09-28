---
sidebar_navigation:
  title: Notifications
  priority: 590
description: In-app notifications in OpenProject
keywords: notifications
---
# In-app notifications

This section will introduce in-app notifications and explain how to work with them. 

## Overview of in-app notifications in OpenProject

In-app notifications are a tool to get notified about requests, changes and new assignments in OpenProject. The notifications can work as an alternative to email notification, or be used in parallel. This feature is enabled by default.

<video src="https://openproject-docs.s3.eu-central-1.amazonaws.com/videos/OpenProject-In-app-notifications.mp4" type="video/mp4" controls="" style="width:100%"></video>

## Accessing in-app notifications

Whenever you are getting in-app notification, a red elliptical with the number of notifications is displayed on the bell symbol on the upper right side of the OpenProject screen between the module button and the help button. (Please note, if there are more than 99 notifications, the elliptical will simply be red without a number in it).

To view the notifications, please left-click on the bell symbol. By default, your notifications are sorted by work package.

![notifications](IaN-1.png)

This will then take you to the **notification center**.

To access the in-app notification settings. Please left-click the "Notification settings" button in the upper right side or navigate via **My account > Notification settings**.

By default, messages are grouped by work package, and the number in the blue bubble next to each work package displays the number of related messages that are associated with each work package. Alternatively, these notifications can also be accessed from within a given work package under the **Activity** tab in the details view.

![notification-center](notification-center.png)

The exclamation mark within the bell symbol on the right side of the notification center indicates that there are unread notifications.

By clicking on a row in the notification center, you will see the details in the split screen.

![notification-center](notification-center-16366289566021.png)


To make viewing notifications more manageable, OpenProject includes several ways to filter or group notifications.

You can filter or group the notifications using the two areas in the left menu bar (1 and 2), or bulk edit notifications by selecting options in the top right (3) of the screen:

1. You can filter by your **involvement**, for example filter for notifications that originated from mentions (@mentioned), from work packages you were assigned to or were accountable for or are simply watching.

2. You can filter by **project**, for example filter for notifications that originated from a specific project.

3. You can also filter notifications for **Unread** or **All** (Read and Unread) notifications. There you can also mark all messages as read.

4. The [**Notification settings**](./notification-settings) button will bring you to your personal notification settings to configure your notification preferences.

5. When selecting any of the notifications, you can also view more **details in the split screen**, for example comments members made regarding a specific work package. Unread messages are indicated by a blue bubble. You can even edit directly in this view.

In addition to the in-app notifications, you will also get a once-a-day summary of all notifications by email. To fine-tune Email Reminders, [click here](../../getting-started/my-account/#email-reminders).

## Mark in-app notifications as read

To mark in-app notifications as read, there are several options in the notification center:

- To mark a notification as read, click on the envelope icon on the right side of the message line. Please note that if there are several updates to one work package, the blue bubble displays the total number of updates. The **Mark as read** icon next to a work package will mark all updates of a work package as read.

![mark-as-read](mark-as-read.png)

- You can also use the **Mark as Read** button at the bottom of the split-screen view of a work package in the notification center to mark a single message as read.

   ![notifications-bottom-bar](notifications-bottom-bar-4292960.png)

- Also, you can set the notifications as read in the work package full screen view by clicking on the envelope icon in the upper right corner of the details view.

![notification-full-screen-view-work-package](notification-full-screen-view-work-package.png)

- To mark all messages as read click on the **Mark all as read** button in the header navigation of the notification center. Please note that the **Mark all as read** button only marks notifications as read that are currently in view. You may have to ultimately press **Mark all as read** multiple times to mark all of your notifications as read if you have a lot of them. The red elliptical will update the number of unread messages in real-time, and eventually disappears when there are no more unread notifications.

  ![notification-center-mark-all-as-read](notification-center-mark-all-as-read-4293156.png)

## In-app notifications outside the notification center

Besides controlling all your notifications in the notification center, the in-app notifications are also visible in the a work packages module. If a work package has some notification related with it, the total count of notifications will be displayed in the Activity tab. 

![notifications-activity-tab](notifications-activity-tab.png)

In the work packages module you can also perform the individual mark as read actions as explained above:

- In the split screen view of the work package, you can mark all notifications of a work package as read in the bottom bar:

  ![notifications-bottom-bar](notifications-bottom-bar-4292960.png)

- In the work package full screen view, the action to mark all the notifications of a work package as read is placed in the header bar of the work package: 

  ![notification-full-screen-view-work-package](notification-full-screen-view-work-package.png)
