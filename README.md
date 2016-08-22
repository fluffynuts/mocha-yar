# mocha-yar

### Yet Another Mocha Reporter

A Mocha test reporter designed to be more useful for continuous testing, including:

1. Running counts of passed / failed / total tests
2. Wrapping of console.log so that:
    1. You can actually see logs
    2. They don't interfere with live counts (much)
    3. You can tell where the logs come from (!!)
3. Mad colorz, yo!
4. Enable timing of tests:
    1. Via config: ``` { time: { test: true, total: true } } ```
    2. Via environment variables: `TIME_TEST` and `TIME_TOTAL`
        - you can use the special values "true", "false", "1" and "0" or any truthy value
    3. Environment variables override config, if the config exists

### What you get

Yet another Mocha reporter

### What you don't get

Any kind of guarantee that this is the code you're looking for

### What you can do

1. Keep all pieces if it breaks
2. Modify and redistribute it, with kudos, of course

### Why? There are so many other reporters!

You're right. None that I found gave me (karma / jasmine)-like feedback whilst running. 
No runner that I've seen helps you to hunt down rogue console.log() calls. Other than
that, this is totally pointless. Feel free to tell your friends how pointless it is!
They will surely be impressed.
