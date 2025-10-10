import textwrap

story = '''                              "Flight_404_Lost_Gift"
Tony is a solo traveller, fond of journeys and surprises. On a trip he was visiting his best friend Stark. 
He bought with him a luggage full of gifts for Stark and was all set to fly. 
His journey started from an airport with a planned transit at a random European airport. 
When he reaches to the arrival hall, he realizes that his luggage is missing!! 
The airline system has mixed up baggage across several flights around the Europe. 
They offer him money as compensation for the lost luggage. Refusing to accept the loss, They turns it into a mission to find the luggage. 
So, airline authority decided to hire a person—The player—to find his lost luggage.

The player starts with limited resources: money and fuel range. 
Each airport holds a chance to find gifts or even the lost luggage, hidden inside mysterious boxes. 
Sometimes opening a mystery box costs money or fuel, but the reward could be massive.

There is also pickpockets in some airport. If the player meets them, he will lose his all money.

The game becomes a strategic adventure: calculating flight distances, managing fuel, buying more fuel if necessary, and carefully choosing the next airport in range. 
Every decision can bring the player closer to Tony’s luggage or lead to an unfortunate crash.

Finally, if the player discovers the lost luggage and returns to the starting airport, the mission is accomplished: Tony’s gifts are saved, and the adventure is won! 
Otherwise, if the player runs out of fuel or fails to locate the luggage, the journey ends in failure.'''

# Set column width to 80 characters
wrapper = textwrap.TextWrapper(width=80, break_long_words=False, replace_whitespace=False)
# Wrap text
word_list = wrapper.wrap(text=story)


def getStory():
    return word_list
