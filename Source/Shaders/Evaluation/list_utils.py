import os
import pickle

def save_list(file_path, my_list):
    """
    Saves a Python list to a file using pickle.
    
    Args:
        file_path (str): The full file path (including directory) to save the list to.
        my_list (list): The list to be saved.
    """
    # Create the directory if it doesn't exist
    directory = os.path.dirname(file_path)
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    with open(file_path, 'wb') as f:
        pickle.dump(my_list, f)

def load_list(file_path):
    """
    Loads a Python list from a file using pickle.
    
    Args:
        file_path (str): The full file path (including directory) to load the list from.
    
    Returns:
        list: The list loaded from the file.
    """
    with open(file_path, 'rb') as f:
        return pickle.load(f)