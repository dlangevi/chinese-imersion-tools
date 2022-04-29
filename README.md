## What this is for

My workflow for learning Chinese is currently centered around immersion based
learning. The primary way that I am picking up new words and characters is
through reading books. While other projects exist that support immersion based
learning (Migaku and ChineseTextAnalyser being two I used extensively), I hope
that this project will fulfill a slightly different niche.

Many existing programs expect you to be in front of the computer while you are
reading with a popup dictionary for assistance. I personally am unable to spend
much time doing this so I prefer to read paper books / use an ereader.

The most tedious part of learning for me was making flashcards. I origginally
would highlight sentences in my kindle and later go through them on my computer,
creating flashcards out of them. But this was time consuming, and it was hard to
know what words I should select. From this I decided to create a program which
would find all 1T sentences in the books I wish to read, and automate much of
the flashcard creation process.

## Installation

Currently I think the only thing this will depend on is mongodb and npm. Clone
the repo, install mongodb and you should be able to run this on your own
computer. You will also need to write a 'config.json' file which sits in the
repo. Currently most of the user data is stored on the filesystem, and this file
tells us where various files should be stored. Honestly I wouldn't bother trying
to run this until I have moved all fs storage to mongodb

## Roadmap for the future

It would be nice to host this somewhere, but this will cost money, and will also
require a lot of features like user logins etc. To get to that point the
following will be needed

- User logins
- Seperate data on per user basis

Also much of the current system is based on running lua scripts I wrote for CTA
(v1 of this project was just a generated txt file created by CTA). I no longer
actually depend on it, so it would be nice to abstract away that entire process

Should create workflows in the application to

- Upload books to personal library
- Manage books in library

It would also be nice to have the following

- Create script/plugin to sync calibre books with website library
- Create lua script for use in CTA which can segment someones text and add it to
  library (if someone has been using CTA for a while, it would be nice if they
  could continue to use the same text segmentation/wordlist)

Currently I make flashcards using the Migaku plugin, which integrates well with
an website based application (and is much of the reason I chose to do this using
javascript/html) However I want this to be useable as a standalone project so

- Create workflow for creating flashcards and sending them to anki (preferably
  with just one click of a button)
- Allow for user configuration of what goes into a flashcard
- Support different anki card formats (as great as mine is I am sure others have
  different needs)

Part of the reason for this project is also to allow me to improve my skills
while in between jobs. Having been primarily a c++/python backend systems
developer, this project has been a great learning experience for using various
web technologies. I also wish to get some experience with other technologies,
and so a very long goal is to rewrite this in either go or rust, as a standalone
desktop application. Once I feel that this web based version has all the
features I need, I can then move to rewriting it in another language.

## Acknowledgements

Thanks to https://startbootstrap.com/template/sb-admin for the template I used
to start this project. I hope it will soon be unrecognizable

Thanks to ChineseTextAnalyser and Migaku for much of the inspiration for ideas I
have implemented in this project. While both programs work well, it was the
missing features that I needed which motivated me to make my own software for
immersion learning.
