import streamlit as st
import pandas as pd

# Load data
data = pd.read_csv('Sorted_Data.csv')

# Title of the app
st.title('Football Player Scouting Dashboard')

# Search bar for player names
player_name = st.text_input('Search for a player by name')

# Filters
league = st.selectbox('Select League', options=['All'] + list(data['Comp'].unique()))
position = st.selectbox('Select Position', options=['All'] + list(data['Pos'].unique()))

# Data processing based on filters
filtered_data = data.copy()
if player_name:
    filtered_data = filtered_data[filtered_data['Player'].str.contains(player_name, case=False)]
if league != 'All':
    filtered_data = filtered_data[filtered_data['Comp'] == league]
if position != 'All':
    filtered_data = filtered_data[filtered_data['Pos'] == position]

# Display data
st.dataframe(filtered_data)

# Sort by numerical features
sort_by = st.selectbox('Sort by', options=['Gls', 'Ast', 'xG', 'xA', 'Cmp%', 'Tkl'])
ascending = st.radio('Ascending', options=[True, False])
sorted_data = filtered_data.sort_values(by=sort_by, ascending=ascending)

st.dataframe(sorted_data)

import plotly.express as px

# Visualization: Top 10 players by goals
st.subheader('Top 10 Players by Goals')
top_10_goals = filtered_data.nlargest(10, 'Gls')
fig = px.bar(top_10_goals, x='Player', y='Gls', color='Team', title='Top 10 Players by Goals')
st.plotly_chart(fig)


