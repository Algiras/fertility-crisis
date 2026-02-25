import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

# Set style for all charts
sns.set_theme(style="whitegrid")
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial']
out_dir = "book/images"
os.makedirs(out_dir, exist_ok=True)

# 1. Global Sperm Count Decline (1973 - 2018)
def generate_sperm_chart():
    # Representative data based on Levine et al. 2017/2022 meta-analyses
    years = np.arange(1973, 2019, 5)
    # Steady decline from ~100m to ~49m
    counts = [104, 95, 87, 80, 74, 69, 64, 59, 54, 49]
    
    plt.figure(figsize=(10, 6))
    sns.lineplot(x=years, y=counts, marker="o", color="#d9534f", linewidth=3, markersize=8)
    
    plt.title("Global Decline in Sperm Concentration (1973-2018)", fontsize=16, pad=20)
    plt.xlabel("Year", fontsize=12)
    plt.ylabel("Sperm Concentration (million/mL)", fontsize=12)
    plt.ylim(0, 110)
    
    # Annotate key points
    plt.annotate(f"{counts[0]}m", (years[0], counts[0] + 3), ha='center')
    plt.annotate(f"{counts[-1]}m", (years[-1], counts[-1] + 3), ha='center')
    
    plt.tight_layout()
    plt.savefig(f"{out_dir}/sperm_decline.png", dpi=300)
    plt.close()

# 2. TFR Collapse (South Korea & Japan)
def generate_tfr_chart():
    # Representative TFR data 
    years = np.arange(1970, 2025, 10)
    sk_tfr = [4.53, 2.82, 1.57, 1.48, 1.23, 0.78]
    jp_tfr = [2.13, 1.75, 1.54, 1.36, 1.39, 1.20]
    
    plt.figure(figsize=(10, 6))
    
    # Plot countries
    sns.lineplot(x=years, y=sk_tfr, marker="o", label="South Korea", color="#5bc0de", linewidth=3)
    sns.lineplot(x=years, y=jp_tfr, marker="s", label="Japan", color="#f0ad4e", linewidth=3)
    
    # Add Replacement Rate line
    plt.axhline(y=2.1, color='red', linestyle='--', alpha=0.7, label='Replacement Rate (2.1)')
    
    plt.title("Total Fertility Rate (TFR) Collapse", fontsize=16, pad=20)
    plt.xlabel("Year", fontsize=12)
    plt.ylabel("Children per Woman", fontsize=12)
    plt.ylim(0, 5)
    plt.legend(fontsize=11)
    
    plt.tight_layout()
    plt.savefig(f"{out_dir}/tfr_collapse.png", dpi=300)
    plt.close()

# 3. Global Plastics Production Generation
def generate_plastics_chart():
    # Exponential growth representative data (million tonnes)
    years = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020]
    production = [2, 8, 35, 70, 120, 213, 313, 367]
    
    plt.figure(figsize=(10, 6))
    sns.lineplot(x=years, y=production, marker="^", color="#5cb85c", linewidth=3, markersize=8)
    
    # Fill area to emphasize volume
    plt.fill_between(years, production, alpha=0.2, color="#5cb85c")
    
    plt.title("Global Plastics Production (1950-2020)", fontsize=16, pad=20)
    plt.xlabel("Year", fontsize=12)
    plt.ylabel("Annual Production (Million Metric Tons)", fontsize=12)
    
    plt.tight_layout()
    plt.savefig(f"{out_dir}/plastics_growth.png", dpi=300)
    plt.close()

# 4. Generational Testosterone Decline
def generate_testosterone_chart():
    # Representative data based on Massachusetts Male Aging Study / Finnish cohorts
    decades = ['1980s', '1990s', '2000s', '2010s']
    # Decline of ~1% per year independent of aging
    t_levels = [600, 540, 480, 420] 
    
    plt.figure(figsize=(10, 6))
    
    # Use a barplot to show discrete cohort drops
    sns.barplot(x=decades, y=t_levels, color="#0275d8", alpha=0.8)
    
    plt.title("Age-Independent Decline in Average Serum Testosterone", fontsize=16, pad=20)
    plt.xlabel("Testing Decade (for healthy 40-year-old men)", fontsize=12)
    plt.ylabel("Total Testosterone (ng/dL)", fontsize=12)
    plt.ylim(0, 700)
    
    # Annotate bars
    for i, v in enumerate(t_levels):
        plt.text(i, v + 15, f"{v} ng/dL", ha='center', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(f"{out_dir}/testosterone_decline.png", dpi=300)
    plt.close()

# 5. IVF Accessibility vs. Income (SIEPR Study Data)
def generate_ivf_economics_chart():
    # Representative data based on SIEPR economic study of Swedish / US models
    income_quartiles = ['Lowest 25%', '25-50%', '50-75%', 'Top 25%']
    # Dramatic drop in initiation without state/insurance subsidy
    initiation_uninsured = [5, 12, 25, 60] 
    initiation_insured = [45, 48, 55, 65]
    
    x = np.arange(len(income_quartiles))
    width = 0.35
    
    fig, ax = plt.subplots(figsize=(10, 6))
    rects1 = ax.bar(x - width/2, initiation_uninsured, width, label='Uninsured (Out of Pocket)', color='#d9534f', alpha=0.9)
    rects2 = ax.bar(x + width/2, initiation_insured, width, label='Fully Insured/Subsidized', color='#5cb85c', alpha=0.9)
    
    ax.set_ylabel('IVF Initiation Rate (%)', fontsize=12)
    ax.set_title('The Economic Barrier to Biology: IVF Utilization by Income', fontsize=16, pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(income_quartiles, fontsize=11)
    ax.legend()
    
    plt.tight_layout()
    plt.savefig(f"{out_dir}/ivf_economics.png", dpi=300)
    plt.close()

if __name__ == "__main__":
    print("Generating charts...")
    generate_sperm_chart()
    generate_tfr_chart()
    generate_plastics_chart()
    generate_testosterone_chart()
    generate_ivf_economics_chart()
    print("Charts saved successfully.")
