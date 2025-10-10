import random
import story
import mysql.connector
from geopy import distance


# Database connection
connection = mysql.connector.connect(
    host="localhost",
    port=3306,
    database="Flight_404_Lost_Gift",
    user="root",
    password="pysquad",
    autocommit=True
)


# FUNCTIONS
# Select 15 airports for the game
def get_airports():
    sql="""SELECT iso_country, ident, name, type, latitude_deg, longitude_deg
FROM airport
WHERE continent = 'EU' 
AND type='large_airport'
ORDER by RAND()
LIMIT 15;"""
    cursor = connection.cursor(dictionary=True)
    cursor.execute(sql)
    result = cursor.fetchall()
    cursor.close()
    return result


# Get all goals
def get_goals():
    sql="SELECT * FROM goal;"
    cursor = connection.cursor(dictionary=True)
    cursor.execute(sql)
    result = cursor.fetchall()
    cursor.close()
    return result


# Make mystery box opened
def set_mysterybox_opened(port_id):
    sql = "DELETE FROM ports WHERE id = %s;"
    cursor = connection.cursor()
    cursor.execute(sql, (port_id,))
    cursor.close()


# Create game
def create_game(start_money, fuel_range, current_airport, player_name, airports):
    sql="INSERT INTO game (money, fuel_range, location, screen_name) VALUES (%s, %s, %s, %s);"
    cursor = connection.cursor(dictionary=True)
    cursor.execute(sql,(start_money, fuel_range, current_airport, player_name))
    game_id = cursor.lastrowid

    # Set up Mystery box
    goals = get_goals()
    goal_list = []
    for goal in goals:
        for i in range(goal['probability']):
            goal_list.append(goal['id'])

     # Separating starting airport
    other_airports = airports[1:].copy()
    random.shuffle(other_airports)

    for i, goal_id in enumerate(goal_list):
        if i >= len(other_airports):
            break
        sql = "INSERT INTO ports (game, airport, goal) VALUES (%s, %s, %s);"
        cursor = connection.cursor(dictionary=True)
        cursor.execute(sql, (game_id, other_airports[i]['ident'], goal_id))

    return game_id


# Get airport info
def get_airport_info(airport):
    sql = '''SELECT iso_country, ident, name, type, latitude_deg, longitude_deg
            FROM airport
            WHERE ident = %s'''
    cursor = connection.cursor(dictionary=True)
    cursor.execute(sql,(airport,))
    result = cursor.fetchone()
    return result


# Check if airport has a goal
def check_goal(game_id, current_airport):
    sql = '''SELECT ports.id, goal, goal.id as goal_id, name, money 
    FROM ports 
    JOIN goal ON goal.id = ports.goal 
    WHERE ports.game = %s AND ports.airport = %s'''
    cursor = connection.cursor(dictionary=True)
    cursor.execute(sql, (game_id, current_airport))
    result = cursor.fetchone()
    if result is None:
        return False
    return result


# Update location
def update_location(current_airport, fuel_range, player_money, game_id):
    sql = '''UPDATE game 
    SET location = %s, 
    fuel_range = %s, 
    money = %s 
    WHERE id = %s'''
    cursor = connection.cursor(dictionary=True)
    cursor.execute(sql, (current_airport, fuel_range, player_money, game_id))


# Calculate distance between two airports
def calculate_distance(current, target):
    start = get_airport_info(current)
    end = get_airport_info(target)
    return distance.distance((start['latitude_deg'], start['longitude_deg']),
                             (end['latitude_deg'], end['longitude_deg'])).km


# Find airports in range
def airports_in_range(current_airport, other_airports, fuel_range):
    in_range = []
    for all_airport in other_airports:
        dist = calculate_distance(current_airport, all_airport['ident'])
        if dist <= fuel_range and dist != 0:
            in_range.append(all_airport)
    return in_range


# Starting Game


# Asking to show the story
storyDialogue = input("Would you like to read the story? (Y/N): ")
if storyDialogue.upper() == "Y":
    if hasattr(story, "getStory"):
        for line in story.getStory():
            print(line)


# Asking for player name
print('When you are ready to start,')
player = input('Type player name: ')

# Game over and win
game_over = False
win = False

# Starting money
money = 999

# Starting range (km)
fuel_range = 2000

# Score
score = 0

# lost Luggage found
gift_found = False

# Get airport and start game
all_airports = get_airports()
start_airport = all_airports[0]['ident']
current_airport = start_airport
game_id = create_game(money, fuel_range, start_airport, player, all_airports)


# GAME LOOP
while not game_over:
    # get current airport info
    airport = get_airport_info(current_airport)
    # show game status
    print(f'''\nYou are at {airport['name']}.''')
    print(f'''You have {money:.0f}$ and {fuel_range:.0f}km of range.''')
    input('\033[32mPress Enter to continue...\033[0m')

    # Check for goal
    goal = check_goal(game_id, current_airport)
    if goal:
        options = []
        if money > 350:
            options.append("350$")
        if fuel_range > 275:
            options.append("275km range")
        options_str = " or ".join(options)

        if not options:
            print("You don’t have enough money or fuel to open this mystery box.")
        else:
            question = input(
                f"Do you want to open the mystery box for {options_str}? M = money, F = range, Enter to skip: ")
            choice = question.upper()

            if choice in ['M', 'F']:
                if choice == 'M':
                    money -= 350
                elif choice == 'F':
                    fuel_range -= 275

                if goal['money'] > 0:
                    money += goal['money']
                    print(f'''Congratulations! You found {goal['name']}. That is worth {goal['money']}$!''')
                    print(f'''You have now {money:.0f}$''')
                elif goal['money'] == 0:
                    win = True
                    print('''Congratulations! You found the Luggage! Return to your starting airport to win.''')
                else:
                    money = 0
                    print("""
                     ╔══💸══💸══💸══💸══╗
                         😱 Oh no!!!
                      💀 You were robbed!
                    All your money is gone!
                     ╚══💸══💸══💸══💸══╝
                    """)

                # Mark mystery box as opened
                set_mysterybox_opened(goal['id'])

        input("\033[32mPress Enter to continue...\033[0m")

    # Ask to buy fuel
    if money > 0:
        question2 = input('Do you want to by fuel? (1$ = 3km). Enter amount or press enter. ')
        if question2:
            amount = float(question2)
            if amount > money:
                print('''You don't have enough money.''')
            else:
                fuel_range += amount * 3
                money -= amount
                print(f'''You have now {money:.0f}$ and {fuel_range:.0f}km of range''')


    # Show airports in range. if none, game over
    airports = airports_in_range(current_airport, all_airports, fuel_range)
    print(f"\n\033[34mThere are {len(airports)} airports in range:\033[0m")
    if len(airports) == 0:
        print('You are out of range.')
        game_over = True
        break
    else:
        for airp in airports:
            airport_distance = calculate_distance(current_airport, airp['ident'])
            print(f'''{airp['name']}, ({airp['ident']}): {airport_distance:.0f}km''')

        # Ask for destination
        destination = input('Enter destination airport ident: ')
        if destination not in [a['ident'] for a in airports]:
            print("Invalid airport! Try again.")
            continue

        selected_distance = calculate_distance(current_airport, destination)
        fuel_range -= selected_distance
        update_location(destination, fuel_range, money, game_id)
        current_airport = destination

        if fuel_range < 0:
            print("The plane has crashed!")
            print("You ran out of fuel mid-flight!")
            game_over = True


    # if diamond is found and player is at start, game is won
    if win and current_airport == start_airport:
        print(f'''You won! You have {money}$ and {fuel_range}km of range left.''')
        game_over = True

# Game over loop
if win:
    print(f"""
CONGRATULATIONS! You WON the adventure!\nFinal Balance: {money:.0f}$\nRemaining Range: {fuel_range:.0f} km""")
else:
    print(f"""
GAME OVER\nYou LOST the journey!\nFinal Balance: {money:.0f}$\nRemaining Range: {fuel_range:.0f} km""")