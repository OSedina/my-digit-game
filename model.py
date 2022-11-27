import base64
import uuid
import numpy as np
import torch
import torchvision
import os
import shutil
from tqdm import tqdm
from torchvision import transforms, models

class Model(object):

    def __init__(self):
        model = models.resnet18(pretrained=True)

        for param in model.parameters():
            param.requires_grad = False

        model.fc = torch.nn.Linear(model.fc.in_features, 10)

        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        model = model.to(device)

        checkpoint = torch.load('models/model.pt', map_location='cpu')
        model.load_state_dict(checkpoint['state_dict'])
        model.eval()

        self.model = model


    def save_image(self, image):
        self.clear_folder('data/temp')

        self.filename = 'digit-temp' +  '__' + str(uuid.uuid1()) + '.jpg'
        path = 'data/temp/' + self.filename

        with open(path, "wb") as f:
            f.write(image)

    def clear_folder(self, folder):
        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print('Failed to delete %s. Reason: %s' % (file_path, e))

    def predict(self, image_b64):

        image_encoded = image_b64.split(',')[1]
        image = base64.decodebytes(image_encoded.encode('utf-8'))

        self.save_image(image)

        self.clear_folder('test')

        shutil.copytree(os.path.join('./data/temp/', ''), os.path.join('test', 'unknown'))

        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

        class ImageFolderWithPaths(torchvision.datasets.ImageFolder):
            def __getitem__(self, index):
                original_tuple = super(ImageFolderWithPaths, self).__getitem__(index)
                path = self.imgs[index][0]
                tuple_with_path = (original_tuple + (path,))
                return tuple_with_path

        test_transforms = transforms.Compose([
            transforms.Resize((100, 100)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

        test_dataset = ImageFolderWithPaths('test', test_transforms)
        test_dataloader = torch.utils.data.DataLoader(test_dataset)

        test_predictions = []
        test_img_paths = []

        for inputs, labels, paths in tqdm(test_dataloader):
            inputs = inputs.to(device)
            labels = labels.to(device)

            with torch.set_grad_enabled(False):
                preds = self.model(inputs)
                test_predictions.append(torch.nn.functional.softmax(preds).data.cpu())
                test_img_paths.extend(paths)

        test_predictions = np.concatenate(test_predictions, axis=0)
        out = np.argmax(test_predictions)

        answer = {'answer': int(out)}
        return answer