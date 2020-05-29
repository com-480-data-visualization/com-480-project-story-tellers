# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Mariam Hakobyan | 298698 |
| Tianchi Yu | 319877 |
| Wenuka Gunarathna | 309398 |

[Milestone 1](#milestone-1-friday-3rd-april-5pm) • [Milestone 2](#milestone-2-friday-1st-may-5pm) • [Milestone 3](#milestone-3-thursday-28th-may-5pm)

## Milestone 1 (Friday 3rd April, 5pm)

**10% of the final grade**

The project aims to visualize the swiss transport connections in different parts of the country and provide statistical-graphical visualization on the nodes connectivity, travelling time from station to station and pessenger capacities.

**Please find the full report on [Milestone1.ipynb](https://github.com/com-480-data-visualization/com-480-project-story-tellers/blob/master/Milestone%201.ipynb)**

## Milestone 2 (Friday 1st May, 5pm)

**10% of the final grade**

In this file we develop the following steps for Milestone 2.

* Review of Milestone 1
* Sketches of website/visualization we want to achieve
* Tools and past lectures to develop the visualization
* Independent pieces of how to achieve into the final visualization
* Extra ideas to develop after successfully meeting the plan
* Initial website running with minimal viable product

**Please find the full report on [Milestone 2.md](https://github.com/com-480-data-visualization/com-480-project-story-tellers/blob/master/Milestone%202.md)**

## Milestone 3 (Thursday 28th May, 5pm)

**80% of the final grade**

The webpage - https://threestorytellers.github.io/

The Screencast - https://www.youtube.com/watch?v=nHvX1FvPKV8&feature=emb_title

The Process book - https://github.com/com-480-data-visualization/com-480-project-story-tellers/blob/master/Process_book.pdf

### Note
Please do note that we have only included a fraction of data for the visualization, because the limit of our web host (github.io) is 100MB maximum file size. If you are interested to visualize the full data please download the data from [this link](https://drive.google.com/open?id=1nLsCipYOiNJrqZbq53XUXr9dTu-JL1bf) and add it to the <github.io project path>/api/gtfs-data and change the api to local api by altering  <github.io project path>/static/js/config.js line 26 as follows
```
"api_paths.trips": "api/inc/controllers/trips.php?hhmm=[hhmm]&ymd=[ymd]&vtype=[vtype]"
```
This should call the local API and read the data from the gtfs.db SQLite database, which we included in the above link.

Please do note that you need to run this api inside a server that support PHP (we tested it on 7.2) and SQLite.
