import re


def clean_text(text):
    # Removes ONLY SINGLE spaces between consecutive uppercase letters
    # Note: we replace \s+ by a single space ' ' in the regex
    cleaned_text = re.sub(r"(?<=[A-Z]) (?=[A-Z])", "", text)
    # Removes remaining multiple spaces (which could be word separators)
    # and replaces them with a standard single space.
    cleaned_text = re.sub(r"\s{2,}", " ", cleaned_text)
    print(f"Original text: '{text}'")
    print(f"Cleaned text  : '{cleaned_text.strip()}'")
    return cleaned_text.strip()
