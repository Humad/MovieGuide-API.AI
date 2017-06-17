# MovieGuide-API.AI
An agent created using API.AI, Node.js, and Express.js

# Introduction
Movie Guide is an agent created using API.AI with a webhook that was created using Node.js and Express.js. 
It is integrated with Actions on Google and can be used on devices such as smartphones running Android, and Google Home.

Alternatively, you can interact with Movie Guide on your browser by going [here](https://bot.api.ai/3ade4c0c-0b75-4fb9-a659-1518e26c6207)

Update (5/9/2017): One of the APIs used in the development of this project has since changed. This results in MovieGuide not being able to give the correct ratings for some movies.

Update (6/17/2017): Due to API.AI requiring a fast response from the server, the response sometimes fails because the Heroku dynos didn't start up in time. This causes the application to crash until I manually restart it. I'm looking into other solutions, but as of now MovieGuide is **not** fully functional.

# What does it do?
Movie Guide offers information to the user about movies. Users can interact with it using their voice or through text.

Here are some interaction samples:


You can invoke Movie Guide on your Google/Android device like this,

![Invocation](/sample-screenshots/invocation.png?raw=true "Invocation")

You can ask for movie details such as,

![Who stars](/sample-screenshots/who-stars.png?raw=true "Who stars?")

And,

![Who directs](/sample-screenshots/who-directs.png?raw=true "Who directs?")

You can also ask things like,

![Starring](/sample-screenshots/starring.png?raw=true "Starring")

Movie Guide remembers what you were talking about, through the power of contexts!

![Follow up](/sample-screenshots/follow-up.png?raw=true "Follow up")

# Limitations
- My webhook is hosted on Heroku on its free plan. This means that it takes a few seconds for the server to start working when invoked for the first time.
When the server is loading up, or if it somehow crashes, Movie Guide will let you know.

- The two APIs I am using to gather information about movies are limited in their functionality, especially when it comes to obtaining information about directors and actors. Therefore, sometimes, Movie Guide will be unable to provide COMPLETE information. It tries its best though :)
~I will be updating the application once a more sophisticated API is available, or until I finish working on my web scraper.~


