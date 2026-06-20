import httpx
from bs4 import BeautifulSoup
import re
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.models import Club
from app.services.scraper import clean_text

async def run_club_scraper_pipeline(db: AsyncSession) -> int:
    """
    Scrapes live clubs and committees from https://www.daiict.ac.in/dean-students,
    parses name, description, contact details, and categories,
    and inserts them into the database if they do not already exist.
    """
    url = "https://www.daiict.ac.in/dean-students"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/91.0.4472.124 Safari/537.36"
        )
    }
    
    new_clubs_count = 0
    
    try:
        print(f"Scraping clubs and committees from: {url}")
        async with httpx.AsyncClient(headers=headers, timeout=25) as client:
            r = await client.get(url)
            if r.status_code != 200:
                print(f"Failed to fetch dean-students page. HTTP status: {r.status_code}")
                return 0
                
            soup = BeautifulSoup(r.text, "html.parser")
            
            # Scrape tab-3 (Committees) and tab-4 (Clubs)
            targets = [("tab-3", "Committee"), ("tab-4", "Club")]
            
            for tab_id, category in targets:
                tab = soup.find(id=tab_id)
                if not tab:
                    print(f"Tab {tab_id} not found on the page.")
                    continue
                    
                info_blocks = tab.find_all(class_="clubs_info")
                print(f"Found {len(info_blocks)} blocks in {tab_id} ({category}).")
                
                for block in info_blocks:
                    name_tag = block.find("h2")
                    if not name_tag:
                        continue
                    name = clean_text(name_tag.text.strip())
                    if not name:
                        continue
                        
                    # Parse paragraphs to separate description, contact info, and email
                    paras = block.find_all("p")
                    desc_parts = []
                    contact_lines = []
                    email_str = ""
                    
                    for p in paras:
                        text = p.text.strip()
                        if not text:
                            continue
                            
                        # If contains "Contact :" or is obviously a contact section
                        if "Contact :" in text or "Contact:" in text:
                            val = text.replace("Contact :", "").replace("Contact:", "").strip()
                            val = re.sub(r'\s+', ' ', val)
                            if val:
                                contact_lines.append(val)
                        # If contains email
                        elif "Email" in text or "Email :" in text or "@" in text or "[at]" in text:
                            val = text.replace("Email :", "").replace("Email:", "").strip()
                            val = re.sub(r'\s+', ' ', val)
                            if val:
                                email_str = val
                        else:
                            # Skip if social-icons container
                            if not p.find(class_="social-icons"):
                                desc_parts.append(text)
                                
                    description = clean_text("\n".join(desc_parts).strip())
                    
                    # Construct contact details
                    contact_info_text = ", ".join(contact_lines)
                    if email_str:
                        # Clean up email [at] and [dot] formats
                        email_clean = email_str.replace("[at]", "@").replace("[dot]", ".").replace(" ", "")
                        if contact_info_text:
                            contact_info_text = f"{contact_info_text} ({email_clean})"
                        else:
                            contact_info_text = email_clean
                    
                    contact_info = clean_text(contact_info_text.strip())
                    
                    # Deduce how to join
                    how_to_join = "Contact the club coordinators or convener via email to register or participate."
                    if "join" in description.lower() or "open to all" in description.lower():
                        how_to_join = "Open to all DAU students. Contact coordinators to join or attend events."
                    
                    # Check if club already exists
                    dup_check = await db.execute(
                        select(Club).where(Club.name == name)
                    )
                    existing_club = dup_check.scalar_one_or_none()
                    
                    if existing_club:
                        print(f"Club already exists in database: {name}. Skipping.")
                        continue
                        
                    # Create new Club record
                    new_club = Club(
                        name=name,
                        description=description,
                        category=category,
                        how_to_join=how_to_join,
                        contact_info=contact_info or "Dean of Students Office",
                        source_link=f"{url}#{tab_id}"
                    )
                    
                    db.add(new_club)
                    new_clubs_count += 1
                    
            await db.commit()
            print(f"Club scraper pipeline completed. Added {new_clubs_count} new entries.")
            
    except Exception as e:
        print(f"Error in club scraper pipeline: {e}")
        await db.rollback()
        
    return new_clubs_count

if __name__ == "__main__":
    import asyncio
    from app.db.session import SessionLocal
    
    async def main():
        print("Starting manual scrape of DA-IICT clubs...")
        async with SessionLocal() as db:
            count = await run_club_scraper_pipeline(db)
            print(f"Manually processed: {count} new clubs/committees.")
            
    asyncio.run(main())
