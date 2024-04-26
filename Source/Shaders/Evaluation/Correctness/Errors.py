from PIL import Image
import numpy as np
from IPython.display import display
import matplotlib.pyplot as plt

def decode(png_file_path):
    # Load the image using PIL
    img = Image.open(png_file_path)
    # Convert the image to RGBA (in case it's not)
    img_rgba = img.convert("RGBA")

    # Convert the image to a numpy array
    data = np.array(img_rgba, dtype=np.uint32)

    # Perform the equivalent operation of the GLSL function
    # Shift and combine RGBA components
    ivalue = (data[:, :, 0] |
              (data[:, :, 1] << 8) |
              (data[:, :, 2] << 16) |
              (data[:, :, 3] << 24))

    # Interpret the integer bits as floats
    floats = np.frombuffer(ivalue.tobytes(), dtype=np.float32)
    floats = floats.reshape(ivalue.shape)

    return floats


def decoded_IDE_to_image(float_matrix):
    # Initialize an empty image with the same dimensions and RGBA format
    img_data = np.zeros((float_matrix.shape[0], float_matrix.shape[1], 4), dtype=np.uint8)

    # Iterate over each element in the float matrix
    for i in range(float_matrix.shape[0]):
        for j in range(float_matrix.shape[1]):
            value = float_matrix[i, j]

            # Handling edge cases
            if value == -100:
                # Blue color for -100
                img_data[i, j] = [0, 0, 255, 255]  # RGBA
            elif value == -1:
                # Red color for -1
                img_data[i, j] = [255, 0, 0, 255]  # RGBA
            else:
                # Normal case: scale by 1/1000
                scaled_value = int(min(max(value / 1000, 0), 1) * 255)
                img_data[i, j] = [scaled_value, scaled_value, scaled_value, 255]  # RGBA

    # Create an image from the numpy array
    img = Image.fromarray(img_data, 'RGBA')
    return img


def decoded_HDE_to_image(float_matrix):
    # Initialize an empty image with the same dimensions and RGBA format
    img_data = np.zeros((float_matrix.shape[0], float_matrix.shape[1], 4), dtype=np.uint8)

    # Iterate over each element in the float matrix
    for i in range(float_matrix.shape[0]):
        for j in range(float_matrix.shape[1]):
            value = float_matrix[i, j]

            # Handling edge cases
            if value == -1:
                # Red color for -1
                img_data[i, j] = [0, 0, 255, 255]  # RGBA
            else:
                # Normal case: scale by 1/1000
                scaled_value = int(min(max(value / 10, 0), 1) * 255)
                img_data[i, j] = [scaled_value, scaled_value, scaled_value, 255]  # RGBA

    # Create an image from the numpy array
    img = Image.fromarray(img_data, 'RGBA')
    return img


def HDE(image_path, print_output=False, display_image=False):
    decoded = decode(image_path)

    total_pixels = decoded.size

    # count the number of -1 and -100 values
    num_no_intersection = np.sum(decoded == -1)

    # average the positive values
    positive_values = decoded[decoded > 0]
    average_HDE = np.mean(positive_values)
    highest_value = np.max(positive_values)
    lowest_value = np.min(positive_values)
    median_value = np.median(positive_values)

    result_dict = {
        "num_no_intersection_HDE": num_no_intersection,
        "average_HDE": average_HDE,
        "highest_HDE": highest_value,
        "lowest_HDE": lowest_value,
        "median_HDE": median_value
    }

    if print_output:
        print((
            f"For {image_path.split("\\")[-1]}:\n"
            f"\tAmong {total_pixels} pixels:\n"
            f"\tNumber of no intersections: {num_no_intersection}\n"
            f"\tAverage HDE value: {average_HDE}\n"
            f"\tLowest HDE value: {lowest_value}\n"
            f"\tHighest HDE value: {highest_value}"
        ))

    decoded_image = decoded_HDE_to_image(decoded)
    if display_image:
        display(decoded_image)

    return result_dict


def IDE(image_path, print_output=False, display_image=False):
    decoded = decode(image_path)

    total_pixels = decoded.size

    # count the number of -1 and -100 values
    num_missed_intersection = np.sum(decoded == -1)
    num_no_intersection = np.sum(decoded == -100)

    # average the positive values
    positive_values = decoded[decoded > 0]
    average_IDE = np.mean(positive_values)
    highest_value = np.max(positive_values)
    lowest_value = np.min(positive_values)
    median_value = np.median(positive_values)

    result_dict = {
        "num_missed_intersection_IDE": num_missed_intersection,
        "num_no_intersection_IDE": num_no_intersection,
        "average_IDE": average_IDE,
        "highest_IDE": highest_value,
        "lowest_IDE": lowest_value,
        "median_IDE": median_value
    }


    if print_output:
        print((
            f"For {image_path.split("\\")[-2]}:\n"
            f"\tAmong {total_pixels} pixels:\n"
            f"\tNumber of missed intersections (-1): {num_missed_intersection}\n"
            f"\tNumber of no intersections (-100): {num_no_intersection}\n"
            f"\tAverage IDE value: {average_IDE}\n"
            f"\tMedian IDE value: {median_value}\n"
            f"\tLowest IDE value: {lowest_value}\n"
            f"\tHighest IDE value: {highest_value}"
        ))

    decoded_image = decoded_IDE_to_image(decoded)
    if display_image:
        display(decoded_image)
    
    return result_dict


def IDE_distance_constraint_1(image_path, distance_path, num_brackets, print_output=False, display_image=False):
    decoded = decode(image_path)

    img = Image.open(distance_path)
    img_rgba = img.convert("RGBA")
    distances = np.array(img_rgba, dtype=np.uint32)
    print(distances)

    result = []

    for i in range(num_brackets):
        min_distance = 255 / num_brackets * i
        max_distance = 255 / num_brackets * (i + 1)
        # consider only the red channel
        mask = (distances[:, :, 0] >= min_distance) & (distances[:, :, 0] <= max_distance)
        print(f"In mask: {np.sum(mask)} pixels for distance {min_distance} to {max_distance}")

        # treat pixels outside the distance range as -100 -- no intersection
        decoded = np.where(mask, decoded, -100)

        total_pixels = decoded.size

        # count the number of -1 and -100 values
        num_missed_intersection = np.sum(decoded == -1)
        num_no_intersection = np.sum(decoded == -100)

        # average the positive values
        positive_values = decoded[decoded > 0]
        average_IDE = np.mean(positive_values)
        highest_value = np.max(positive_values)
        lowest_value = np.min(positive_values)
        median_value = np.median(positive_values)

        result_dict = {
            "num_missed_intersection": num_missed_intersection,
            "num_no_intersection": num_no_intersection,
            "average_IDE": average_IDE,
            "highest_value": highest_value,
            "lowest_value": lowest_value,
            "median_value": median_value
        }
        result.append(result_dict)

        if print_output:
            print((
                f"For {image_path.split("\\")[-2]}:\n"
                f"\tAmong {total_pixels} pixels:\n"
                f"\tNumber of missed intersections (-1): {num_missed_intersection}\n"
                f"\tNumber of no intersections (-100): {num_no_intersection}\n"
                f"\tAverage IDE value: {average_IDE}\n"
                f"\tMedian IDE value: {median_value}\n"
                f"\tLowest IDE value: {lowest_value}\n"
                f"\tHighest IDE value: {highest_value}"
            ))

        decoded_image = decoded_IDE_to_image(decoded)
        if display_image:
            display(decoded_image)
    
    return result


def path_to_value(path):
    filename = path.split("\\")[-1]
    filename = filename[1:]
    filename = filename.split("-")[0]
    value = float(filename)
    return value


