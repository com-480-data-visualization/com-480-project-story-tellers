# Content

In this file we develop the following steps for Milestone 2. 

* Review of Milestone 1, 
* Sketches of website/visualization we want to achieve, 
* Tools and past lectures to develop the visualization, 
* Independent pieces of how to achieve into the final visualization,
* Extra ideas to develop after successfully meeting the plan,
* Initial website running with minimal viable product.

Students: Mariam Hakobyan (298698), Tianchi Yu (319877), Wenuka Gunarathna (309398)

## Review of Milestone 1

According to our project goal in Milestone 1, our aim is to visualize the 
* Part 1. Flow of public transportation in Switzerland in an interactive map, 
* Part 2. Figures to describe the features of transportation system.

We are going to describe the frontend and backend plan accordingly.

## Sketches of website/visualization

The frontend of the website will contain 

* Interactive map
* Travel routine histogram figure
* Connectivity
* Transport resources
* Team

### Interactive Map 
The very initial page of the website will be the map of Switzerland bounderies and moving points as transportation. The illustration is intended to be for one work day from morning to night to see the flow of the transportation points. 

1. The user will have opportunity to see different modes of the map by adjusting the **{Show, Colors, Filter}** sections in **Options** bar (ref n8 in sketch)
2. There will be a **time bar** in the down of the map which will indicate the time of the day the flow is running (ref n13 in the sketch). According to the time of the day the background of the map will change from **night mode to day mode**.
3. **Extra**: We are also thinking of ways to inform user about the map options in an user-friendly way, that is why a voice-over may be added to the map (ref n11 in the sketch), and by the user choice can be played to tell some narrative and interesting facts about the map.

![Map](https://raw.githubusercontent.com/com-480-data-visualization/com-480-project-story-tellers/master/pic/map.jpg)

### Travel routine
Besides map we are also interested to implement some quantitative figures. So after the user is done with investigating the map and its functionalities, they can scroll down and see the **Travel routine** histogram which will show the 

* x-axis - time of the day
* the number of schedules running in each time interval.

The plot will be interactive in terms of showing the exact number of transportation while user hovers arond the time intervals.

**Extra** We may also add filtering functionality for the user to see for example how the figure changes for cantons or different transportation types. 

![Travel_routine](https://raw.githubusercontent.com/com-480-data-visualization/com-480-project-story-tellers/master/pic/travel_routine.jpg)

### Connectivity 

As transportation is all about nodes(stations) and edges(connections) we want to use the Force Directed Graph to show the connectivity of the big stations. In that case, in the graph the nodes will be stations and the edges stand for the direct(no transit) connectivity between each two stations. Point will be colored according to cantons. 

By this graph, of course we can see the location and distance of all stations, which can show the whole transport system in the abstractive way. What we want to tell by this graph is not only **the connectivity** but also the importance of different stations at the level of **"necessity"**. This graph will be dynamic and interactive, when you move one node, all the structure will be distorted caused by the "force" of this node. And we can tell the influence of stations for all the transport system by comparing different levels of deformation.

![Connectivity Graph](https://raw.githubusercontent.com/com-480-data-visualization/com-480-project-story-tellers/master/pic/connectivity.jpg)

### Transport resources
We are interested to visualize the transportation type distribution in each canton. To that end we will develop a basic stacked barplot on our data. 
![Transport_resources](https://raw.githubusercontent.com/com-480-data-visualization/com-480-project-story-tellers/master/pic/transport_resources.jpg)

### Team 

We will also introduce our team members in the end of the website.

## Tools and past lectures to use

Tools we will use
* [Bootstrap template](https://blackrockdigital.github.io/startbootstrap-agency/) for frontend HTML/CSS content,
* [Trafimage API](https://github.com/geops/trafimage-maps) - this is a map API incorportated by SBB which gives detailed routes for all types of transportations in Switzlerand,
* [D3.js histogram](https://www.d3-graph-gallery.com/graph/histogram_binSize.html) for travel routine graph,
* [D3-force](https://observablehq.com/@d3/force-directed-graph) for connectivity graph,
* [d3.js stacked barplot](https://www.d3-graph-gallery.com/graph/barplot_stacked_basicWide.html) for transport resources graph,
* Python to apply data processing.

From past lectures and exercise sessions we will of course use D3.js tutorial and the lecture about maps and define what is good for users.

## Independent pieces 

We will implement the core visualization first **dynamic Map with its functionalities** by incorporating the Trafimage API and changing it to our needs. Data processing needs to be done for map-options to work well( i.e. filter from the schedules where the transportation type is metro).

Once we have the minimum functions of the map, we will start to work on data preparation for graphs and their implementation. 

## Extra ideas
Please consider all the parts mentioned as **extra** above and also we think to show the hierarchy of stations by the Radial Tree taking the capacity and connecticity as the judgement criteria, if time allows.

## Initial website
You can find the website skeleton on https://threestorytellers.github.io/(https://threestorytellers.github.io/)


