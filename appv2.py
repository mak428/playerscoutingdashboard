import streamlit as st
import pandas as pd
import plotly.express as px

# Sample CSV file paths
# Replace these paths with your actual CSV files
GOALKEEPER_FILE = '/Users/mukikrishnan/Desktop/Interactive Soccer Dashboard/Positional Stats/Goalkeeping/Sorted Data/GoalkeepingSortedData.csv'
DEFENDER_FILE = '/Users/mukikrishnan/Desktop/Interactive Soccer Dashboard/Positional Stats/Defending/Sorted Data/DefendingSortedData.csv'
MIDFIELDER_FILE = '/Users/mukikrishnan/Desktop/Interactive Soccer Dashboard/Positional Stats/Midfielding/Raw Data/FBRef Top 5 Leagues Midfielding Statistics 2023-24 - FixerSheet.csv'
FORWARD_FILE = '/Users/mukikrishnan/Desktop/Interactive Soccer Dashboard/Positional Stats/Attacking/Sorted Data/ForwardsSortedData.csv'
GK_ARCHETYPE_FILE = '/Users/mukikrishnan/Desktop/Interactive Soccer Dashboard/Archetype Classification/Classified Archetypes/GKArchetypes.csv'
DEF_ARCHETYPE_FILE = '/Users/mukikrishnan/Desktop/Interactive Soccer Dashboard/Archetype Classification/Classified Archetypes/DefenderArchetypes.csv'
MIDFIELDER_ARCHETYPE_FILE = '/Users/mukikrishnan/Desktop/Interactive Soccer Dashboard/Archetype Classification/Classified Archetypes/MidfielderArchetypes.csv'
FORWARD_ARCHETYPE_FILE = '/Users/mukikrishnan/Desktop/Interactive Soccer Dashboard/Archetype Classification/Classified Archetypes/ForwardArchetypes.csv'

# Initialize a session state for shortlist
if 'shortlist' not in st.session_state:
    st.session_state.shortlist = []

# Sidebar for navigation
st.sidebar.title('Navigation')
page = st.sidebar.radio("Go to", ["Home", "Basic Filter Search", "Player Comparison", "Player Archetype", "Player Shortlist"])

# Home Page
if page == "Home":
    st.title("Interactive Soccer Player Dashboard")
    st.write("""
    This app offers an interactive experience to explore soccer player statistics. You can:
    - Search and filter players based on their stats.
    - Compare two players side by side.
    - Explore player archetypes based on clustering algorithms.
    - Save favorite players to a shortlist for later reference.
    """)

# Basic Filter Search Page
elif page == "Basic Filter Search":
    st.title("Basic Filter Search")

    # Position selection
    position = st.selectbox("Select Position", ["Goalkeeper", "Defender", "Midfielder", "Forward"])
    
    # Load the appropriate dataset
    if position == "Goalkeeper":
        df = pd.read_csv(GOALKEEPER_FILE)
    elif position == "Defender":
        df = pd.read_csv(DEFENDER_FILE)
    elif position == "Midfielder":
        df = pd.read_csv(MIDFIELDER_FILE)
    else:
        df = pd.read_csv(FORWARD_FILE)
    
    # Search and filter options
    player_name = st.text_input('Search for a player by name')
    league = st.selectbox('Select League', options=['All'] + list(df['Comp'].unique()))
    team = st.selectbox('Select Team', options=['All'] + list(df['Team'].unique()))

    # Filter data
    filtered_df = df.copy()
    if player_name:
        filtered_df = filtered_df[filtered_df['Player'].str.contains(player_name, case=False)]
    if league != 'All':
        filtered_df = filtered_df[filtered_df['Comp'] == league]
    if team != 'All':
        filtered_df = filtered_df[filtered_df['Team'] == team]

    # Display filtered data
    st.dataframe(filtered_df)

    # Save to shortlist option
    for i, row in filtered_df.iterrows():
        if st.button(f"Save {row['Player']} to shortlist"):
            st.session_state.shortlist.append(row['Player'])

# Player Comparison Page
elif page == "Player Comparison":
    st.title("Player Comparison")

    # Select position to compare players from the same position
    position = st.selectbox("Select Position", ["Goalkeeper", "Defender", "Midfielder", "Forward"])
    
    # Load the appropriate dataset and pick appropriate metrics
    if position == "Goalkeeper":
        df = pd.read_csv(GOALKEEPER_FILE)
        metrics = ['PSxG', 'Save%', '#OPA', 'Launch%']
    elif position == "Defender":
        df = pd.read_csv(DEFENDER_FILE)
        metrics = ['Tkl+Int', 'TklW', 'Challenges', 'Blocks']
    elif position == "Midfielder":
        df = pd.read_csv(MIDFIELDER_FILE)
        metrics = ['Cmp%', 'KP', 'G+A', 'Live', 'Carries', 'Tkl+Int']
    else:
        df = pd.read_csv(FORWARD_FILE)
        metrics = ['Gls', 'Ast', 'npxG', 'SoT%', 'Head Won%']

    # Select players to compare
    player_1 = st.selectbox('Select Player 1', df['Player'])
    player_2 = st.selectbox('Select Player 2', df['Player'])

    # Display comparison
    player_1_stats = df[df['Player'] == player_1]
    player_2_stats = df[df['Player'] == player_2]

    st.write(f"**{player_1} vs {player_2}**")
    st.write("Player 1 Stats", player_1_stats)
    st.write("Player 2 Stats", player_2_stats)

    # Visualize comparison (e.g., goals, assists, xG)
    fig = px.bar(pd.concat([player_1_stats, player_2_stats]), x='Player', y=metrics, barmode='group')
    st.plotly_chart(fig)

# Player Archetype Page
elif page == "Player Archetype":
    st.title("Player Archetypes")

    # Select position
    position = st.selectbox("Select Position", ["Goalkeeper", "Defender", "Midfielder", "Forward"])

    # Archetype descriptions for goalkeepers
    goalkeeper_archetype_descriptions = {
        'Sweeper Keeper': "These goalkeepers clean up balls from out wide or come out far; potentially even outside their box to play as an extra player or to initiate passes and start counter-attacks with direct through balls. It means that they can come out quickly and clean up balls which then puts them in an advantageous position to restart play, including long clearances.",
        'Modern GK': "These goalkeepers have a greater emphasis on distribution, with more short passes and key passes, and less number of long-launched goalkicks.",
        'Classic GK': "These goalkeepers are excellent shot-stoppers, but have less of an emphasis placed on distribution. They will have a much higher launch %, meaning they do more long kicks."
    }

    # Archetype descriptions for defenders
    defender_archetype_descriptions = {
        'Libero': "The libero literally means “to sweep”. They will stay behind the defensive line, looking to sweep up through balls, pick up extra forward players and make goal saving plays",
        'Ball Playing Center Back': "This is the more common role seen in modern football with defenders having to play out of the back and be excellent in passing.",
        'Central Defender': "Main job is to clear the ball from danger when needed to. In certain tactics this includes being good on the feet and maintaining possession.",
        'Classic Defender': "The “old-school” role of a defender with only one thing in mind: clear it and stop attacks. The goal of the defender with this duty is to win the ball and get it cleared up the field and take no risks in doing so.",
        'Classic Full Back': "The full back remains primarily a defensive player but will move forward when the team needs extra width. They are also more of a supportive role when going forward and not necessarily always in attac",
        'Wing Back': "The wing back fulfills both the attacking duties of a winger and the defensive duties of a full back. They are seen up and down the wide positions on the pitch, looking to put in attacking play up the pitch, support the midfield and fall back into defense.",
        'Inverted Wing Back': "An inverted wing back will line up as a standard wide defender, but they will move in field when in possession rather than stick wide to either create space or be an extra passing option."
    }

    # Archetype descriptions for midfielders
    midfielder_archetype_descriptions = {
        'Classic CM': "The central midfielder is the link player and a hard worker. Rather than being more technically adept like a box-to-box midfielder, the central midfielder will perform various roles based on instruction, their abilities, and the needs of the team.",
        'Regista': "Like a Deep Lying Playmaker but has way more freedom. Overall an aggressive, fast-paced midfielder who will look to press high, dictate the play from deep positions and offer creative outlets or transitional plays.",
        'Box-to-Box': "The “workhorse” of the midfield. Their attributes allow these players to contribute on all avenues of the pitch; attacking means their surging late into the box, have killer passes and provide a threat from distance.",
        'Segundo Volante': "A direct translation for Segundo Volante is “Second Steering Wheel”. This archetype is mainly a defensive role and a late support when going forward. They often run with the ball, arrive in an area with a late run and are the “second steering wheel” in supporting the attacking play.",
        'Mezzala': "The direct translation is “wing half or half wing(er)”. So, this player is a central player that likes to drift wide but not too far wide as they are only a “half wing”: meaning they operate in the half-spaces.",
        'Deep Lying Playmaker': "Operates in the spaces between the defense and midfield. They aim to start attacking plays by passing out to players or spaces further up the pitch. They are more creative but must also fulfill their defensive duties.",
        'Ball Winning Midfielder': "The ball winning midfielder has the main role of closing-down the opposition and winning the ball back.",
        'Anchor Man': "The main duty of this player is to sit between the defense and midfield. Their main job is to win the ball, intercept moves, runs and if recouping the ball, pass it on to a more creative player.",
        'Attacking Midfielder': "Plays just in front of the central midfield role, therefore they are not found in deeper positions. They can either play just in front of the opposition midfield or just behind, they use their technical and mental abilities to create chances and screw with opposition defenders.",
        'Advanced Playmaker': "This player will look to find space in-between the oppositions midfield and defense. Their main role is be available for their teammates, whether that is to pass to, run into an open space or when out of possession find the pass or run to get onto the attack immediately.",
        'Wide Midfielder': "The stereotypical player in a standard 4-4-2, performing both the defensive and attacking duties out wide. They are supportive players who perform work for all three avenues of the pitch: defense, midfield and attack.",
        'Wide Playmaker': "The wide playmaker is a dual role. In possession, the player will be a source of creativity by drifting inside or out wide to find space and therefore a chance. Defensively (which is not common) their role is to provide cover for the defensive wide players such as the full backs."
    }

    # Archetype descriptions for midfielders
    forward_archetype_descriptions = {
        'Classic Winger': "A winger primarily sticks wide towards the sideline, bombs forward either with the ball or beats the opposition and attack the byline.",
        'Inverted Winger': "The Inverted Winger has the goal of creating and opening space for onrushing wide players such as the full backs. Like the Inside Forward they will look to create and focus on their stronger foot which is opposite to the side of the pitch they are positioned on.",
        'Inside Forward': "More of a common sight in the modern game, the goal of an inside forward is to run from out wide towards the center of the opposition defense and penalty box. The reason for this is to make use of the strongest foot of the player which is the opposite of the side of the pitch he plays on",
        'Target Man': "The physical “big-man” up front who is a “nuisance” for defenders. Ideally the play is brought to them to open up more attacking play.",
        'Complete Forward': "The “all-round forward”, they can shoot, hold up the ball, have that ability to be in the right place at the right time AND can pass the ball.",
        'Poacher': "The main goal is to break past the defensive line and score goals. Build up play is not seen from this player as the creative build up is to end with them scoring. They will make runs and plays where their “instincts” will create opportunities both inside and around the box.",
        'Second Striker': "Best suited with a partner upfront, the Second Striker is a goal-scorer. They look to find themselves in goal scoring positions outside that of their partner striker and close down the opposition when out of possession.",
        'False Nine': "A striker or center forward who drops deep into midfield. They do this to drag opposition defenders out of position, exploit space and create lanes for other attacking players."
    }

    # Load the appropriate dataset
    if position == "Goalkeeper":
        df_archetype = pd.read_csv(GK_ARCHETYPE_FILE)
    elif position == "Defender":
        df_archetype = pd.read_csv(DEF_ARCHETYPE_FILE)
    elif position == "Midfielder":
        df_archetype = pd.read_csv(MIDFIELDER_ARCHETYPE_FILE)
    else:
        df_archetype = pd.read_csv(FORWARD_ARCHETYPE_FILE)

    # Select an archetype for goalkeepers
    if position == "Goalkeeper":
        archetype = st.selectbox('Select Archetype', ['Sweeper Keeper', 'Modern GK', 'Classic GK'])
        
        # Display the description for the selected archetype
        st.write(goalkeeper_archetype_descriptions[archetype])
        
        # Filter the players based on the selected archetype
        filtered_archetypes = df_archetype[df_archetype['Ideal Archetype'] == archetype]
        st.dataframe(filtered_archetypes)

    # Select an archetype for defenders
    elif position == "Defender":
        archetype = st.selectbox('Select Archetype', ['Libero', 'Ball Playing Center Back', 'Central Defender', 'Classic Defender', 'Classic Full Back', 'Wing Back', 'Inverted Wing Back'])
        
        # Display the description for the selected archetype
        st.write(defender_archetype_descriptions[archetype])
        
        # Filter the players based on the selected archetype
        filtered_archetypes = df_archetype[df_archetype['Ideal Archetype'] == archetype]
        st.dataframe(filtered_archetypes)
    
    # Select an archetype for defenders
    elif position == "Midfielder":
        archetype = st.selectbox('Select Archetype', ['Classic CM', 'Regista', 'Box-to-Box', 'Segundo Volante', 'Mezzala', 'Deep Lying Playmaker', 'Ball Winning Midfielder', 'Anchor Man', 'Attacking Midfielder', 'Advanced Playmaker', 'Wide Midfielder', 'Wide Midfielder'])
        
        # Display the description for the selected archetype
        st.write(midfielder_archetype_descriptions[archetype])
        
        # Filter the players based on the selected archetype
        filtered_archetypes = df_archetype[df_archetype['Ideal Archetype'] == archetype]
        st.dataframe(filtered_archetypes)

    # Select an archetype for defenders
    else:
        archetype = st.selectbox('Select Archetype', ['Classic Winger', 'Inverted Winger', 'Inside Forward', 'Target Man', 'Complete Forward', 'Poacher', 'Second Striker', 'False Nine'])
        
        # Display the description for the selected archetype
        st.write(forward_archetype_descriptions[archetype])
        
        # Filter the players based on the selected archetype
        filtered_archetypes = df_archetype[df_archetype['Ideal Archetype'] == archetype]
        st.dataframe(filtered_archetypes)

# Player Shortlist Page
elif page == "Player Shortlist":
    st.title("Player Shortlist")
    
    # Show saved players
    st.write("Your shortlisted players:")
    for player in st.session_state.shortlist:
        st.write(player)




