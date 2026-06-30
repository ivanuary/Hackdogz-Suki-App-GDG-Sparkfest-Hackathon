# SUKI — Supporting Underserved Kabuhayan Industries
**Made by Hackdogz:** 
  - Reign Allyson Lasco
  - Sydney Ryan Magsanay Jr.
  - Gabriel Ivan Morauda
  - Christian Lloyd B. Tabafunda
> This project is developed for Google Developers Group on PUP Sparkfest 2026 Hackathon

## Project Brief
SUKI is a search and discovery app that helps people find palengkes, talipapa, and sari-sari stores stores near them by product, store name, or area. It is built around a simple idea: local vendors, especially small businesses, are often hard to find and compare, even though they are the stores people rely on everyday. This repository contains the hackathon minimum viable prototype with a dynamic interface and a Python backend for product search and location-based ranking.

## Problem

Finding local vendors: palengkes, talipapa, sari-sari stores, karinderya, and small specialty shops like bigasan, is mostly word-of-mouth or trial and error by instance. There is no easy way to search across them by what they sell, locate where they are, and compare them immediately. Because of this, shoppers then default to whichever store they already know, even when a closer or better-matching option exists nearby.

This is a problem on both sides. Shoppers struggle to find what they need nearby, and small businesses lose potential customers simply because they have no easy way to be found. Most of these vendors have no online presence at all, so their reach is limited to people who already happen to pass by or know them personally.

## Solution

SUKI is not a general map app and not a delivery platform. It is a simple discovery channel for local commerce, built to serve both sides of the exchange:
 
* **For shoppers:**
  * **Search** — Look up a product, store name, or area and get back a ranked list of matching stores, sorted by distance from the user.
  * **Discover** — Browse a store's full profile: products and prices, reviews, and location, to decide where to go before leaving the house.
* **For small businesses:**
  * **Visibility** — Every store listed gets discoverable through search, without needing their own website, app, or marketing budget. Making foot-traffic-only vendors into something people can actually find.

## Project Tech Stack
 
* **Frontend:** `HTML`, `CSS`, and vanilla `JavaScript`—screen-based navigation (splash, loading, start, results, store, map), responsive layout for mobile and desktop.
* **Backend:** `Python`—modular services for data loading, product search (as well as related searching with `difflib`), distance calculation (`haversine`), and result formatting.
* **Maps:** `OpenStreetMap (OSM)`—powers the location and map views for store discovery.
* **Data:** `JSON`-based store records (name, address, coordinates, payment methods, products) as the current data source for the proof of concept.

## How It Works
 
1. Open the app and tap `OPEN` from the splash screen to load in.
2. Search for a product, store name, or area from the search bar.
3. Browse results that include both exact matches and related products (e.g. searching "chicken" also returns "chicken cubes").
4. Browse the ranked list of matching stores, sorted by distance, with open/closed status shown.
5. Tap a store to view its full profile—mode of payment, products and prices, reviews, and location.
6. Tap `FIND LOCATION` to view the store on the map and check for nearby stores.
 
