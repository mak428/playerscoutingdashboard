#### AKPsi Passion Project: Soccer Player Filter Dashboard

### Step 1: Load and Read the data

# Import libraries
import pandas as pd

# Path to CSV file
file_path = '/Users/mukikrishnan/Desktop/AKPsi Passion Project/FB Ref Passion Project Data Detailed (xG included) - Sheet1.csv'

# Load the CSV file into a DataFrame
df = pd.read_csv(file_path)

# Display the first few rows of the DataFrame
print(df.head())

### Step 2: Data Dictionary
# Remove all features not in the data dictionary

# Make list of columnbs to keep
columns_to_keep = [
    'Gls', 'Ast', 'xG', 'Tkl', 'Nation', 'Team', 'Comp', 'MP', 'Min', '90s', 
    'Starts', 'Subs', 'Cmp', 'Att', 'KP', '1/3', 'npxG', 'xAG', 'PrgP', 'Pos'
]

# Filter the DataFrame to keep only the specified columns
df_filtered = df[columns_to_keep]

# Display the first few rows of the filtered DataFrame
print(df_filtered.head())

### Step 3: Data Cleaning

# Strip the first column of the dataset (unecessary)

# Remove columns 3,4,5 (Gls, xG, Tkl)

# Change players with '2 team' as their team column value to the team they currently play for?

# Figure out what columns you want to keep and what columns you want to remove

## Step 4: Implement Filter (ascending/descending order)






