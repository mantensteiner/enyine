# Timelines / Cards feed
Timelines are basically reports which aggregate interesting data for different user groups.

- are feeds of different types of information presented in a appealing way 
- for different user groups different content can be produced
- security/visibility settings can be considered on timeline generation
- a 'reporting engine' with a as simple as feasable configuration produces the content

'timeline' could be a type in the reporting domain.

These (preferably) tiny, simple reports could be integral part of the marketing growth engine. The timeline
has a short, public Url, which can be liked, tweeted,... (if public).

## Dynamic timelines
Basically a dynamic webapp which lets the user filter,aggregate,... to produce the results he like. 

- security may be complex on filters, aggregations
- casual users may be overwhelmed by too many options
- general site complexity of a dynamic app 

## Static site generators
Instead of querying different domains and collecting data in realtime the markup of a timeline/card/infobit can be produced on the
server and be saved & simply delivered as static asset. Similar to the 'search' domain, the reporting/timeline domain has
access to other domains (see usage of 'apiRegistry').

Different kinds of static assets could be generated, more research for the usecase necessary.

- Feed-like timelines
- Summary Cards
- Tiny info-bits, embeddable aggregated values (e.g. progress percentage of a certain goal, x/y-type,...)

A user could configure the content of different timelines he wants to create and set the visibility to

- private
- space
- public.

Timelines itself could be daily dashboards with just the aggregations/images, all commenting & stuff is then happening 
in social networks where the timeline is linked/embedded. Each timeline entry could be a card to summarize a certain
aggregation.

This is the prefered solution.