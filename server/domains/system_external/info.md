Domain for storing information & config of external systems

# A) External Systems Registration:
- systemKey
- spaceIds with individual externalAuthSharedSecrets
- eventSubscriptions

Also the webhooks for writing back to the systems are registered here (similar to the internal eventSubscriptions). 

###1. A external system get registered. 

e.g. 
- the external system should create/update items of type 'Todo' in the given space.
- on an action in enyine like closing the status of the Todo-item the external system should be updated.
- systemKey and spaceId must be provided in token payload.

###2. A Space gets connected with an the external system. A shared secret must be entered, which is used for authentication
on space level.

- incoming requests should be fine now.

###3. Write to the external system via the event delivery pipeline.

- the external system must have eventSubscriptions configured. the UI must provide capabilities to add event-hooks (like in the eventSubscriptions.js files of the internal domains), which get registered as 'external' in the subscriber-type.
- on certain events this hooks are fired to the set Url with the external-auth-header with the secret for the space.

# B) Own Domain, on premise
For deeper, more fine grained integrations between systems an own domain can be implemented. See github, slack.

Shaping incoming, outgoing data would be possible. The internal eventSubscription system could be used and the internal handlers
of the external domain could prepare data & delegate to the target system.