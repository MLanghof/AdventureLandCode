# AdventureLandCode

> What if we used JavaScript?

This repo holds the code powering my https://adventure.land characters.

It is plain vanilla JS, no typescript. Not even dependencies!

You will find that the code is written with astonishingly little care:
- There are mixed tabs and spaces *everywhere*.
- Are line endings consistent? I haven't checked.
- Indentation conventions are all over the place. 2 spaces? Or 4? What about that hastily added `if (false)` before the function?
- Curly brace placement is inconsistent.
- Naming conventions might as well not exist. Once upon a time the idea was snake_case for inbuilt and camelCase for my own stuff...
- Which file requires which others? Who knows!
- Dead code and past experiments littered throughout (well, most of it doesn't end up in commits).
- Hacks and kludges abound. If it works, it works. For now.
- Who needs documentation? I know what this was for. *Right?*
- Unit tests? What's that?
- And of course, everything is global.

Yes, I know better. But I also know better than to use weakly typed languages *(cue debate over terminology)*, yet here I am. It is liberating in a way (who doesn't like the power to overwrite *any* function?), but then I also dread using `map` because there is zero type safety. :shrug:

Part of my goals here is to explore what bad code feels like. Why *do* we avoid globals? What's so bad about mixing tabs and spaces? I know the answers to these questions, no doubt, but I've never been smacked in the face by them. So here we are, on a wild ride, making all the mistakes as if we're young again... ;)

(Notice how some mistakes are not worth making even here. Like significant code duplication. Or monolithic files. Miss me with those.)
