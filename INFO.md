This file is used to explain common questions or problems that users might have.

## Explanations

### Saving tokens

When you log in and enable the "Remember token" feature, your token will be stored in a file on your local hard drive, specific to your operating system. The file containing all tokens and related information is saved as `auth.dgt` and is encrypted using a basic Caesar cipher. For a detailed understanding of the implementation, you can refer to the `src/settings/auth_saver.rs` file. This method provides a level of security against automated bots that may scan your hard drive for tokens, though it may not be fully secure against malicious users.

## Known Issues

### Cannot edit permissions on a channel

Either channel creation or channel editing, you cannot currently change channel permissions using this app. This is a known _issue_ and there are plans to address it. Discord permission system is _weird_ and there are rumors that they might change in the _near_ future (can't confirm that). Thus working on this feature is on hold for the time being. 

### Other channel types

Currently, there are some unsupported channel types. The reason why for example the media channel is not supported, is that I don't have any place to test it on. If you have any suggestions, please let me know. So for now only the given types are fully supported.
