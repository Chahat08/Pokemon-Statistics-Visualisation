# -*- coding: utf-8 -*-
"""VISLAB1.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1BbMtO0xr-PbSyg6dbRGgOvEvtz6djDhx
"""

from google.colab import drive
drive.mount('/content/drive')

import pandas as pd

stats = pd.read_csv("/content/drive/MyDrive/vis/hw1/pokemon/pokemon.csv") # pokemon statistics dataset
ranks = pd.read_csv("/content/drive/MyDrive/vis/hw1/pokemon/pokemon_ranks.csv") # pokemon ranks dataset

# pikcing important fields from all fields
stats = stats[['name', 'generation', 'is_legendary',
               'attack','defense', 'speed', 'sp_attack', 'sp_defense',
               'hp', 'percentage_male', 'capture_rate',
               'base_happiness', 'base_total', 'base_egg_steps',
               'type1', 'type2',
               'weight_kg','height_m'
       ]]

# renaming the fields to more readable names
stats.rename(columns={'name':"Pokemon"}, inplace=True)
stats.rename(columns={'generation':"Generation"}, inplace=True)
stats.rename(columns={'is_legendary':"Is Legendary?"}, inplace=True)
stats.rename(columns={'attack':"Attack"}, inplace=True)
stats.rename(columns={'defense':"Defense"}, inplace=True)
stats.rename(columns={'speed':"Speed"}, inplace=True)
stats.rename(columns={'sp_attack':"Special Attack"}, inplace=True)
stats.rename(columns={'sp_defense':"Special Defense"}, inplace=True)
stats.rename(columns={'hp':"HP"}, inplace=True)
stats.rename(columns={'percentage_male':"Percentage Male"}, inplace=True)
stats.rename(columns={'capture_rate':"Capture Rate"}, inplace=True)
stats.rename(columns={'base_happiness':"Base Happiness"}, inplace=True)
stats.rename(columns={'base_total':"Base Total"}, inplace=True)
stats.rename(columns={'base_egg_steps':"Base Egg Steps"}, inplace=True)
stats.rename(columns={'type1':"Primary Type"}, inplace=True)
stats.rename(columns={'type2':"Secondary Type"}, inplace=True)
stats.rename(columns={'weight_kg':"Weight in Kilograms"}, inplace=True)
stats.rename(columns={'height_m':"Height in Meters"}, inplace=True)

# merge the stats and ranks datasets based on pokemon name
merged = pd.merge(stats, ranks, on="Pokemon")

# sorting the rows by their rank
merged.sort_values(by="Rank", inplace=True)

# Changing generation field to strings like 1st, 2nd, 3rd...
merged['Generation'] = merged['Generation'].apply(lambda x: str(x) + ('th' if x > 3 else ['st', 'nd', 'rd'][x-1]) if x < 8 else str(x) + 'th')

# Changing is_legendary field to "True" and "False"
merged['Is Legendary?'] = merged['Is Legendary?'].map({0: "False", 1: "True"})

# Changing NaN values in type2 field to "None"
merged['Secondary Type'].fillna("None", inplace=True)

merged.to_csv("/content/drive/MyDrive/vis/hw1/pokemon/merged.csv",index=False) # saving the whole dataset
merged.head(500).to_csv("/content/drive/MyDrive/vis/hw1/pokemon/merged_sampled.csv",index=False) # saving a subset of the dataset containing top 500 pokemon by Rank